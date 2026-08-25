<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Biome;
use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\GameOption;
use App\Models\Player;
use App\Models\Region;
use App\Models\World;
use App\Support\CityLayouts;
use App\Support\StartingConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

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

        $lock = Cache::lock('tgotg:world-create-lock', 10);

        if (! $lock->get()) {
            return response()->json([
                'message' => __('Ya se está iniciando una contienda. Inténtalo en unos segundos.'),
            ], 409);
        }

        try {
            $world = DB::transaction(function () use ($admin, $now, $duration, $multiplier): World {
                $runningWorldIds = World::where('status', 'running')->pluck('id');

                World::whereIn('id', $runningWorldIds)->update([
                    'status' => 'finished',
                    'ended_at' => $now,
                ]);

                Player::whereIn('world_id', $runningWorldIds)->delete();

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

                $region = Region::firstOrCreate(
                    ['key' => 'region1'],
                    ['label' => 'Región 1', 'polygon' => [100, 100, 400, 100, 400, 300, 100, 300], 'sort_order' => 1]
                );
                $biome = Biome::firstOrCreate(
                    ['key' => 'bosque'],
                    ['bonus_resource' => 'wood', 'bonus_value' => 0.10]
                );

                if (! $region->biomes()->where('biomes.id', $biome->id)->exists()) {
                    $region->biomes()->syncWithoutDetaching([$biome->id]);
                }

                $city = City::create(array_merge(
                    StartingConfig::cityValues(),
                    [
                        'player_id' => $player->id,
                        'world_id' => $world->id,
                        'region_id' => $region->id,
                        'biome_id' => $biome->id,
                    ]
                ));

                $plotKeys = array_column(CityLayouts::plots(), 'key');
                $typeIdsByPlotKey = BuildingType::whereIn('key', $plotKeys)->pluck('id', 'key');

                foreach (CityLayouts::plots() as $plot) {
                    Building::create([
                        'city_id' => $city->id,
                        'building_type_id' => $typeIdsByPlotKey[$plot['key']] ?? null,
                        'level' => $plot['key'] === 'ayuntamiento' ? 1 : 0,
                    ]);
                }

                return $world;
            });
        } finally {
            $lock->release();
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
