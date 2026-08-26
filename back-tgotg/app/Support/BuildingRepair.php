<?php

namespace App\Support;

use App\Models\Building;

class BuildingRepair
{
    /**
     * Puntos de vida totales del edificio según su nivel.
     */
    public static function hp(Building $building): int
    {
        $hp = $building->level * (int) config('game_balance.building.hp_per_level');

        if (in_array($building->buildingType->key, ['muralla', 'foso'], true)) {
            $hp = (int) round($hp * (float) config('game_balance.building.hp_factor_defensive'));
        }

        return max($hp, 1);
    }

    /**
     * Puntos de daño a reparar para el porcentaje de daño actual.
     */
    public static function points(Building $building): int
    {
        return (int) ceil($building->damage * self::hp($building) / 100);
    }

    /**
     * Costo de reparar el edificio completo (reparación pagada).
     *
     * @return array{repair_material: string, gold: int, material_amount: int}
     */
    public static function cost(Building $building): array
    {
        $points = self::points($building);

        return [
            'repair_material' => $building->buildingType->repair_material,
            'gold' => $points * (int) config('game_balance.repair.gold_per_point'),
            'material_amount' => $points * (int) config('game_balance.repair.material_per_point'),
        ];
    }
}
