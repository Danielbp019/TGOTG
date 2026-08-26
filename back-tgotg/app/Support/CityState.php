<?php

namespace App\Support;

use App\Models\Building;
use App\Models\City;
use App\Models\Player;

class CityState
{
    /**
     * Aplica el progreso pendiente de reparaciones y mejoras.
     */
    public static function sync(City $city): void
    {
        self::applyRepairProgress($city);
        self::applyUpgradeProgress($city);
    }

    /**
     * Aplica únicamente las mejoras cuyo plazo ya venció.
     */
    public static function applyUpgrades(City $city): void
    {
        self::applyUpgradeProgress($city);
    }

    /**
     * Suma la producción por nivel del edificio mejorado a la ciudad.
     */
    public static function applyProduction(City $city, string $buildingKey): void
    {
        self::applyProductionForUpgrade($city, $buildingKey);
    }

    /**
     * Serializa la ciudad completa para la API.
     *
     * @return array<string, mixed>
     */
    public static function payload(City $city, Player $player): array
    {
        $speedMultiplier = (float) $player->world->speed_multiplier;

        $buildings = $city->buildings
            ->sortBy('buildingType.name')
            ->values()
            ->map(function (Building $building) {
                $plot = CityLayouts::plotForKey($building->buildingType->key);
                $repairCost = $building->damage > 0 && $building->repair_started_at === null
                    ? BuildingRepair::cost($building)
                    : null;

                return [
                    'id' => $building->id,
                    'key' => $building->buildingType->key,
                    'name' => $building->buildingType->name,
                    'category' => $building->buildingType->category,
                    'level' => $building->level,
                    'damage' => $building->damage,
                    'repairing' => $building->repair_started_at !== null,
                    'repairPaid' => $building->repair_paid,
                    'repairMaterial' => $building->buildingType->repair_material,
                    'repairCost' => $repairCost === null ? null : [
                        'gold' => $repairCost['gold'],
                        'material' => $repairCost['repair_material'],
                        'amount' => $repairCost['material_amount'],
                    ],
                    'upgrading' => $building->upgrade_finishes_at !== null,
                    'upgradeFinishesAt' => $building->upgrade_finishes_at?->toIso8601String(),
                    'shape' => $plot['shape'] ?? 'diamond',
                    'x' => $plot['x'] ?? 0,
                    'y' => $plot['y'] ?? 0,
                    'width' => $plot['width'] ?? 0,
                    'height' => $plot['height'] ?? 0,
                ];
            });

        return [
            'name' => $city->name,
            // Los recursos mostrados son los generales del jugador.
            'resources' => [
                'gold' => (int) $player->gold,
                'wood' => (int) $player->wood,
                'stone' => (int) $player->stone,
                'iron' => (int) $player->iron,
                'food' => (int) $player->food,
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
        ];
    }

    private static function applyRepairProgress(City $city): void
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

    private static function applyUpgradeProgress(City $city): void
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

            self::applyProductionForUpgrade($city, $building->buildingType->key);
        }
    }

    private static function applyProductionForUpgrade(City $city, string $buildingKey): void
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
