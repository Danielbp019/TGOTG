<?php

namespace App\Support;

class StartingConfig
{
    /**
     * Niveles iniciales de los edificios de la ciudad de partida.
     */
    private const BUILDING_LEVELS = [
        'ayuntamiento' => 3,
        'granja' => 2,
        'aserradero' => 2,
        'minaPiedra' => 1,
        'minaHierro' => 2,
        'muralla' => 2,
        'foso' => 1,
    ];

    private const POPULATION = 340;

    private const STATIONED_TROOPS = 124;

    private const HAPPINESS = 72;

    /**
     * The base values for a freshly created city.
     *
     * Todos los valores se derivan de config('game_balance'):
     * - oro/h = población × (tax_per_pop + tax_per_town_hall_level × nivel ayuntamiento)
     * - producción/h = base + producción por nivel de cada edificio productor
     * - consumo comida/h = población × food_consumption_per_pop
     * - defensa = base_defense + muralla × wall_defense_per_level + foso × moat_defense_per_level
     * - poder defensivo = defensa + tropas estacionadas × ataque del miliciano (T1)
     *
     * @return array<string, int|string>
     */
    public static function cityValues(): array
    {
        $balance = config('game_balance');
        $levels = self::BUILDING_LEVELS;

        $goldPerHour = (int) round(
            self::POPULATION
                * ((float) $balance['gold']['tax_per_pop']
                    + (float) $balance['gold']['tax_per_town_hall_level'] * $levels['ayuntamiento'])
        );

        $productionKeys = [
            'granja' => 'food',
            'aserradero' => 'wood',
            'minaPiedra' => 'stone',
            'minaHierro' => 'iron',
        ];

        $perHour = [];

        foreach ($productionKeys as $buildingKey => $resource) {
            $perHour[$resource] = (int) $balance['production']['base'][$resource]
                + (int) ($balance['production']['per_level'][$buildingKey][$resource] ?? 0) * $levels[$buildingKey];
        }

        $defense = (int) $balance['combat']['base_defense']
            + (int) $balance['combat']['wall_defense_per_level'] * $levels['muralla']
            + (int) $balance['combat']['moat_defense_per_level'] * $levels['foso'];

        // Ataque del miliciano (T1): referencia para el poder defensivo por tropa.
        $attackPerTroop = 25;

        return [
            'name' => 'Principal',
            'gold' => 12450,
            'wood' => 8300,
            'stone' => 6200,
            'iron' => 4100,
            'food' => 9700,
            'gold_per_hour' => $goldPerHour,
            'wood_per_hour' => $perHour['wood'],
            'stone_per_hour' => $perHour['stone'],
            'iron_per_hour' => $perHour['iron'],
            'food_per_hour' => $perHour['food'],
            'food_consumption_per_hour' => (int) round(
                self::POPULATION * (float) $balance['population']['food_consumption_per_pop']
            ),
            'population' => self::POPULATION,
            'happiness' => self::HAPPINESS,
            'defense' => $defense,
            'stationed_troops' => self::STATIONED_TROOPS,
            'defense_power' => $defense + self::STATIONED_TROOPS * $attackPerTroop,
        ];
    }
}
