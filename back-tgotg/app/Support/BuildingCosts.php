<?php

namespace App\Support;

use App\Models\BuildingType;

class BuildingCosts
{
    /**
     * Coste y tiempo del nivel n (1..5). Materiales y oro escalan ×1.6^(n-1), tiempo ×1.5^(n-1).
     *
     * @return array{gold: int, wood: int, stone: int, iron: int, minutes: int}
     */
    public static function costForLevel(BuildingType $type, int $level): array
    {
        $factor = (float) config('game_balance.building.material_growth_factor', 1.6);
        $timeFactor = (float) config('game_balance.building.time_growth_factor', 1.5);

        $mult = pow($factor, $level - 1);
        $timeMult = pow($timeFactor, $level - 1);

        $round10 = static fn (float $value): int => (int) (round($value / 10) * 10);

        return [
            'gold' => $round10((float) $type->gold_cost * $mult),
            'wood' => $round10((float) $type->wood_cost * $mult),
            'stone' => $round10((float) $type->stone_cost * $mult),
            'iron' => $round10((float) $type->iron_cost * $mult),
            'minutes' => (int) round((float) $type->base_minutes * $timeMult),
        ];
    }
}
