<?php

namespace App\Support;

class StartingConfig
{
    /**
     * The base values for a freshly created city.
     *
     * Los valores se derivan de las fórmulas de config('game_balance'):
     * - oro/h = población × (0,20 + 0,04 × nivel ayuntamiento)
     * - producción = base + producción por nivel de edificio
     * - defensa = 10 + 90 × muralla + 40 × foso
     * - poder defensivo = defensa + tropas estacionadas × 25 (miliciano T1)
     *
     * @return array<string, int|string>
     */
    public static function cityValues(): array
    {
        return [
            'name' => 'Principal',
            'gold' => 12450,
            'wood' => 8300,
            'stone' => 6200,
            'iron' => 4100,
            'food' => 9700,
            'gold_per_hour' => 109,
            'wood_per_hour' => 85,
            'stone_per_hour' => 60,
            'iron_per_hour' => 35,
            'food_per_hour' => 105,
            'food_consumption_per_hour' => 51,
            'population' => 340,
            'happiness' => 72,
            'defense' => 230,
            'stationed_troops' => 124,
            'defense_power' => 3330,
        ];
    }

    /**
     * The initial building plots for a freshly created city.
     *
     * @return list<array<string, string|int>>
     */
    public static function buildings(): array
    {
        return [
            ['key' => 'foso', 'level' => 1, 'x' => 1024, 'y' => 910, 'shape' => 'rect', 'width' => 1800, 'height' => 160],
            ['key' => 'muralla', 'level' => 2, 'x' => 1024, 'y' => 690, 'shape' => 'rect', 'width' => 1750, 'height' => 200],
            ['key' => 'minaPiedra', 'level' => 1, 'x' => 520, 'y' => 480, 'shape' => 'diamond', 'width' => 480, 'height' => 250],
            ['key' => 'ayuntamiento', 'level' => 3, 'x' => 960, 'y' => 470, 'shape' => 'diamond', 'width' => 500, 'height' => 260],
            ['key' => 'minaHierro', 'level' => 2, 'x' => 1420, 'y' => 490, 'shape' => 'diamond', 'width' => 510, 'height' => 260],
            ['key' => 'cuartel', 'level' => 1, 'x' => 640, 'y' => 260, 'shape' => 'diamond', 'width' => 490, 'height' => 250],
            ['key' => 'laboratorio', 'level' => 0, 'x' => 1080, 'y' => 220, 'shape' => 'diamond', 'width' => 500, 'height' => 260],
            ['key' => 'aserradero', 'level' => 2, 'x' => 1500, 'y' => 240, 'shape' => 'diamond', 'width' => 480, 'height' => 250],
            ['key' => 'granja', 'level' => 2, 'x' => 1620, 'y' => 360, 'shape' => 'diamond', 'width' => 490, 'height' => 250],
        ];
    }
}
