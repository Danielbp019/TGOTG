<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameOption;
use App\Models\Player;
use App\Models\World;
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

                Player::create([
                    'world_id' => $world->id,
                    'user_id' => $admin->id,
                    'gold' => StartingConfig::cityValues()['gold'],
                    'wood' => StartingConfig::cityValues()['wood'],
                    'stone' => StartingConfig::cityValues()['stone'],
                    'iron' => StartingConfig::cityValues()['iron'],
                    'food' => StartingConfig::cityValues()['food'],
                ]);

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
