<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesCurrentPlayer;
use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\City;
use App\Support\BuildingCosts;
use App\Support\CityLayouts;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CityController extends Controller
{
    use ResolvesCurrentPlayer;

    public function show(Request $request): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        $city = City::with(['buildings.buildingType'])
            ->where('player_id', $player->id)
            ->first();

        if ($city === null) {
            return response()->json([
                'message' => __('No tienes ninguna ciudad en la contienda actual.'),
            ], 404);
        }

        $this->applyRepairProgress($city);
        $this->applyUpgradeProgress($city);

        $speedMultiplier = (float) $player->world->speed_multiplier;

        $buildings = $city->buildings
            ->sortBy('buildingType.name')
            ->values()
            ->map(function ($building) {
                $plot = CityLayouts::plotForKey($building->buildingType->key);
                $shape = $plot['shape'] ?? 'diamond';
                $x = $plot['x'] ?? 0;
                $y = $plot['y'] ?? 0;
                $width = $plot['width'] ?? 0;
                $height = $plot['height'] ?? 0;

                return [
                    'id' => $building->id,
                    'key' => $building->buildingType->key,
                    'name' => $building->buildingType->name,
                    'category' => $building->buildingType->category,
                    'level' => $building->level,
                    'damage' => $building->damage,
                    'repairing' => $building->repair_started_at !== null,
                    'repairPaid' => $building->repair_paid,
                    'upgrading' => $building->upgrade_finishes_at !== null,
                    'upgradeFinishesAt' => $building->upgrade_finishes_at?->toIso8601String(),
                    'shape' => $shape,
                    'x' => $x,
                    'y' => $y,
                    'width' => $width,
                    'height' => $height,
                ];
            });

        return response()->json([
            'city' => [
                'name' => $city->name,
                'resources' => [
                    'gold' => $city->gold,
                    'wood' => $city->wood,
                    'stone' => $city->stone,
                    'iron' => $city->iron,
                    'food' => $city->food,
                ],
                'perHour' => [
                    'gold' => (int) round($city->gold_per_hour * $speedMultiplier),
                    'wood' => (int) round($city->wood_per_hour * $speedMultiplier),
                    'stone' => (int) round($city->stone_per_hour * $speedMultiplier),
                    'iron' => (int) round($city->iron_per_hour * $speedMultiplier),
                    'food' => (int) round($city->food_per_hour * $speedMultiplier),
                ],
                'population' => $city->population,
                'happiness' => $city->happiness,
                'defense' => $city->defense,
                'stationedTroops' => $city->stationed_troops,
                'defensePower' => $city->defense_power,
                'protectionUntil' => $city->protection_until?->toIso8601String(),
                'worldSize' => CityLayouts::worldSize(),
                'buildings' => $buildings,
            ],
        ]);
    }

    public function upgrade(Request $request, Building $building): JsonResponse
    {
        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        $city = $building->city;

        if ($city === null || $city->player_id !== $player->id) {
            return response()->json([
                'message' => __('Ese edificio no pertenece a tu ciudad.'),
            ], 403);
        }

        // Sincroniza upgrades terminados antes de validar
        $city->load('buildings.buildingType');
        $this->applyUpgradeProgress($city);
        $building->refresh();

        if ($building->damage > 0) {
            return response()->json([
                'message' => __('Ese edificio está dañado. Repáralo antes de mejorarlo.'),
            ], 422);
        }

        if ($building->repair_started_at !== null) {
            return response()->json([
                'message' => __('Ese edificio está en reparación. Espera a que termine.'),
            ], 409);
        }

        if ($building->upgrade_finishes_at !== null) {
            return response()->json([
                'message' => __('Ese edificio ya tiene una mejora en curso.'),
            ], 409);
        }

        $maxLevel = (int) $building->buildingType->max_level;

        if ($building->level >= $maxLevel) {
            return response()->json([
                'message' => __('Ese edificio ya está al nivel máximo.'),
            ], 422);
        }

        $nextLevel = $building->level + 1;
        $cost = BuildingCosts::costForLevel($building->buildingType, $nextLevel);

        // Atajo para pruebas: ?instant=1 en debug o FAST_BUILD_FACTOR en env
        $isInstant = $request->query('instant') === '1' && config('app.debug');
        $fastFactor = (float) env('FAST_BUILD_FACTOR', 0);

        if (
            $city->gold < $cost['gold']
            || $city->wood < $cost['wood']
            || $city->stone < $cost['stone']
            || $city->iron < $cost['iron']
        ) {
            return response()->json([
                'message' => __('No tienes suficientes recursos para mejorar ese edificio.'),
                'cost' => $cost,
            ], 422);
        }

        if ($isInstant) {
            DB::transaction(function () use ($city, $building, $cost, $nextLevel): void {
                $city->decrement('gold', $cost['gold']);
                $city->decrement('wood', $cost['wood']);
                $city->decrement('stone', $cost['stone']);
                $city->decrement('iron', $cost['iron']);

                $building->update([
                    'level' => $nextLevel,
                ]);

                $this->applyProductionForUpgrade($city, $building->buildingType->key);
            });

            $building->refresh();

            return response()->json([
                'building' => [
                    'id' => $building->id,
                    'key' => $building->buildingType->key,
                    'level' => $building->level,
                    'upgrading' => false,
                    'upgradeFinishesAt' => null,
                ],
            ]);
        }

        $minutes = $cost['minutes'];

        if ($fastFactor > 0 && $fastFactor < 1) {
            $minutes = (int) max(1, round($minutes * $fastFactor));
            // Para pruebas muy rápidas: 1 minuto real ≈ segundos si factor 0.01
            // Si quieres segundos exactos, usa FAST_BUILD_FACTOR=0.016 (1min→1s)
        }

        $speedMultiplier = (float) $player->world->speed_multiplier;
        // El tiempo se acorta con la velocidad del mundo
        $effectiveMinutes = $speedMultiplier > 0 ? $minutes / $speedMultiplier : $minutes;
        $finishesAt = now()->addMinutes($effectiveMinutes);

        // Si FAST_BUILD_FACTOR muy pequeño, permite finishes en segundos
        if ($fastFactor > 0 && $fastFactor < 0.02) {
            $effectiveSeconds = (int) max(5, round($effectiveMinutes * 60));
            $finishesAt = now()->addSeconds($effectiveSeconds);
        }

        DB::transaction(function () use ($city, $building, $cost, $nextLevel, $finishesAt): void {
            $city->decrement('gold', $cost['gold']);
            $city->decrement('wood', $cost['wood']);
            $city->decrement('stone', $cost['stone']);
            $city->decrement('iron', $cost['iron']);

            $building->update([
                'upgrade_started_at' => now(),
                'upgrade_finishes_at' => $finishesAt,
                'upgrade_target_level' => $nextLevel,
            ]);
        });

        $building->refresh();

        return response()->json([
            'building' => [
                'id' => $building->id,
                'key' => $building->buildingType->key,
                'level' => $building->level,
                'upgrading' => true,
                'upgradeFinishesAt' => $building->upgrade_finishes_at?->toIso8601String(),
                'targetLevel' => $nextLevel,
                'cost' => $cost,
            ],
        ]);
    }

    /**
     * Order a repair for a damaged building.
     *
     * `paid` deduces gold and material and repairs fast (10 % HP/hora);
     * `auto` is free but slow (1,5 % HP/hora).
     */
    public function repair(Request $request, Building $building): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:paid,auto'],
        ]);

        $player = $this->currentPlayer($request->user()->id);

        if ($player === null) {
            return response()->json([
                'message' => __('No tienes una civilización en la contienda actual.'),
            ], 404);
        }

        $city = $building->city;

        if ($city === null || $city->player_id !== $player->id) {
            return response()->json([
                'message' => __('Ese edificio no pertenece a tu ciudad.'),
            ], 403);
        }

        if ($building->damage <= 0) {
            return response()->json([
                'message' => __('Ese edificio no tiene daños que reparar.'),
            ], 422);
        }

        if ($building->repair_started_at !== null) {
            return response()->json([
                'message' => __('Ese edificio ya tiene una reparación en curso.'),
            ], 409);
        }

        $paid = $data['type'] === 'paid';

        DB::transaction(function () use ($city, $building, $paid) {
            if ($paid) {
                $cost = $this->repairCost($building);

                if ($city->gold < $cost['gold'] || $city->{$cost['repair_material']} < $cost['material_amount']) {
                    abort(422, __('No tienes suficientes recursos para reparar ese edificio.'));
                }

                $city->decrement('gold', $cost['gold']);
                $city->decrement($cost['repair_material'], $cost['material_amount']);
            }

            $building->update([
                'repair_started_at' => now(),
                'repair_paid' => $paid,
            ]);
        });

        return response()->json([
            'building' => [
                'key' => $building->buildingType->key,
                'damage' => $building->damage,
                'repairing' => true,
                'repairPaid' => $paid,
            ],
        ]);
    }

    /**
     * Apply the elapsed repair progress to every damaged building.
     *
     * @return array{repair_material: string, gold: int, material_amount: int}
     */
    private function repairCost(Building $building): array
    {
        $material = $building->buildingType->repair_material;
        $points = $this->damagePoints($building);

        return [
            'repair_material' => $material,
            'gold' => $points * (int) config('game_balance.repair.gold_per_point'),
            'material_amount' => $points * (int) config('game_balance.repair.material_per_point'),
        ];
    }

    private function damagePoints(Building $building): int
    {
        $hp = $this->buildingHp($building);

        return (int) ceil($building->damage * $hp / 100);
    }

    private function buildingHp(Building $building): int
    {
        $hp = $building->level * (int) config('game_balance.building.hp_per_level');

        if (in_array($building->buildingType->key, ['muralla', 'foso'], true)) {
            $hp = (int) round($hp * (float) config('game_balance.building.hp_factor_defensive'));
        }

        return max($hp, 1);
    }

    private function applyRepairProgress(City $city): void
    {
        $now = now();
        $paidRate = (float) config('game_balance.repair.paid_percentage_per_hour');
        $autoRate = (float) config('game_balance.repair.auto_percentage_per_hour');

        foreach ($city->buildings as $building) {
            if ($building->damage <= 0 || $building->repair_started_at === null) {
                continue;
            }

            $elapsedHours = $building->repair_started_at->diffInHours($now, true, true);
            $rate = $building->repair_paid ? $paidRate : $autoRate;
            $repaired = (int) floor($elapsedHours * $rate);

            if ($repaired <= 0) {
                continue;
            }

            if ($repaired >= $building->damage) {
                $building->update([
                    'damage' => 0,
                    'repair_started_at' => null,
                    'repair_paid' => false,
                ]);
            } else {
                $building->update([
                    'damage' => $building->damage - $repaired,
                ]);
            }
        }
    }

    private function applyUpgradeProgress(City $city): void
    {
        $now = now();

        foreach ($city->buildings as $building) {
            if ($building->upgrade_finishes_at === null || $building->upgrade_target_level === null) {
                continue;
            }

            if ($now->lessThan($building->upgrade_finishes_at)) {
                continue;
            }

            $target = (int) $building->upgrade_target_level;

            $building->update([
                'level' => $target,
                'upgrade_started_at' => null,
                'upgrade_finishes_at' => null,
                'upgrade_target_level' => null,
            ]);

            $this->applyProductionForUpgrade($city, $building->buildingType->key);
        }
    }

    private function applyProductionForUpgrade(City $city, string $buildingKey): void
    {
        $perLevel = config('game_balance.production.per_level.'.$buildingKey);

        if (! is_array($perLevel)) {
            return;
        }

        foreach ($perLevel as $resource => $amount) {
            $column = $resource.'_per_hour';

            if (! in_array($column, ['wood_per_hour', 'stone_per_hour', 'iron_per_hour', 'food_per_hour'], true)) {
                continue;
            }

            $city->increment($column, (int) $amount);
        }
    }
}
