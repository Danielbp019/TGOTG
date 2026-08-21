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
     * @deprecated SSOT movido a CityLayouts::plots(). Este método es alias para compat.
     *
     * @return list<array<string, string|int>>
     */
    public static function buildings(string $map = 'bosque'): array
    {
        return CityLayouts::plots($map);
    }
}
