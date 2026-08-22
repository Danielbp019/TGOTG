<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\GameOption;
use App\Models\Player;
use App\Models\World;
use App\Support\CityLayouts;
use App\Support\StartingConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorldController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => __('Solo el administrador puede iniciar una contienda.'),
            ], 403);
        }

        $data = $request->validate([
            'duration_key' => ['required', 'string', 'exists:game_options,key'],
            'multiplier_key' => ['required', 'string', 'exists:game_options,key'],
        ]);

        $duration = GameOption::where('type', GameOption::TYPE_DURATION)
            ->where('key', $data['duration_key'])
            ->first();

        $multiplier = GameOption::where('type', GameOption::TYPE_MULTIPLIER)
            ->where('key', $data['multiplier_key'])
            ->first();

        if ($duration === null || $multiplier === null) {
            return response()->json([
                'message' => __('La duración o la velocidad seleccionada no es válida.'),
            ], 422);
        }

        $admin = $request->user();
        $now = now();

        World::where('status', 'running')->get()->each(function (World $world) use ($now): void {
            $world->update([
                'status' => 'finished',
                'ended_at' => $now,
            ]);

            $world->players()->delete();
        });

        $world = World::create([
            'status' => 'running',
            'duration_days' => (int) $duration->value,
            'speed_multiplier' => $multiplier->value,
            'started_at' => $now,
            'ended_at' => $now->copy()->addDays((int) $duration->value),
            'created_by' => $admin->id,
        ]);

        $player = Player::create([
            'world_id' => $world->id,
            'user_id' => $admin->id,
            'gold' => StartingConfig::cityValues()['gold'],
            'wood' => StartingConfig::cityValues()['wood'],
            'stone' => StartingConfig::cityValues()['stone'],
            'iron' => StartingConfig::cityValues()['iron'],
            'food' => StartingConfig::cityValues()['food'],
        ]);

        $city = City::create(array_merge(
            StartingConfig::cityValues(),
            [
                'player_id' => $player->id,
                'world_id' => $world->id,
            ]
        ));

        foreach (CityLayouts::plots() as $plot) {
            Building::create([
                'city_id' => $city->id,
                'building_type_id' => BuildingType::where('key', $plot['key'])->value('id'),
                'level' => $plot['key'] === 'ayuntamiento' ? 1 : 0,
            ]);
        }

        return response()->json([
            'world' => [
                'id' => $world->id,
                'status' => $world->status,
                'durationDays' => $world->duration_days,
                'speedMultiplier' => $world->speed_multiplier,
                'startedAt' => $world->started_at?->toIso8601String(),
                'endedAt' => $world->ended_at?->toIso8601String(),
            ],
        ], 201);
    }
}
