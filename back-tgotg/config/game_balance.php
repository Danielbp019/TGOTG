<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Balance del juego
    |--------------------------------------------------------------------------
    |
    | Fuente única de verdad para los valores numéricos del juego.
    | Los costos base de edificios y unidades viven en sus tablas
    | (building_types / unit_types); aquí viven las fórmulas y constantes.
    |
    */

    'production' => [
        'base' => [
            'wood' => 35,
            'stone' => 30,
            'iron' => 15,
            'food' => 15,
        ],
        'per_level' => [
            'granja' => ['food' => 45],
            'aserradero' => ['wood' => 25],
            'minaPiedra' => ['stone' => 30],
            'minaHierro' => ['iron' => 10],
        ],
    ],

    'gold' => [
        // Impuesto por habitante por hora: población × (base + nivel ayuntamiento × por_nivel)
        'tax_per_pop' => 0.20,
        'tax_per_town_hall_level' => 0.04,
    ],

    'population' => [
        'food_consumption_per_pop' => 0.15,
        // Tope de población: base + nivel ayuntamiento × por_nivel
        'base_cap' => 250,
        'cap_per_town_hall_level' => 250,
        // Crecimiento por hora: % de la brecha restante hasta el tope
        'growth_rate' => 0.01,
    ],

    'city' => [
        // Costo de la 2.ª ciudad; cada ciudad adicional multiplica por growth_factor
        'base_cost' => [
            'gold' => 40000,
            'wood' => 20000,
            'stone' => 15000,
            'iron' => 10000,
        ],
        'growth_factor' => 2,
        'base_hours' => 12,
    ],

    'building' => [
        // Costo de materiales del nivel n = base × factor^(n-1)
        'material_growth_factor' => 1.6,
        // Tiempo (minutos) del nivel n = base × factor^(n-1)
        'time_growth_factor' => 1.5,
        // Puntos de vida por nivel; muralla y foso usan hp_factor_defensive
        'hp_per_level' => 1000,
        'hp_factor_defensive' => 1.5,
    ],

    'combat' => [
        // Variación aleatoria de ataque y defensa: ±luck %
        'luck' => 0.10,
        'base_defense' => 10,
        'wall_defense_per_level' => 90,
        'moat_defense_per_level' => 40,
        // Penalización al atacante por nivel de foso del defensor
        'moat_penalty_per_level' => 0.04,
        // Porcentaje de cada recurso saqueable al ganar
        'loot_percentage' => 0.40,
    ],

    'damage' => [
        // Daño porcentual al perder la defensa: [base, por_punto_de_exceso]
        'wall' => [0.20, 0.50],
        'moat' => [0.15, 0.40],
        'collateral' => [0.05, 0.20],
        'collateral_cap' => 0.60,
    ],

    'repair' => [
        // Costo por punto de daño reparado de forma pagada
        'gold_per_point' => 3,
        'material_per_point' => 1,
        // % de HP reparado por hora
        'paid_percentage_per_hour' => 10,
        'auto_percentage_per_hour' => 1.5,
    ],

    'protection' => [
        // Horas de escudo tras perder una batalla defensiva (× velocidad del mundo)
        'hours' => 12,
    ],

    // Factor de aceleración de construcciones para pruebas (0 = desactivado).
    // Solo funciona con APP_DEBUG=true; atajo puntual: POST .../upgrade?instant=1
    'fast_build_factor' => env('FAST_BUILD_FACTOR', 0),

    'terrain' => [
        'pradera' => ['food' => 0.10],
        'bosque' => ['wood' => 0.10],
        'montaña' => ['stone' => 0.10],
        'colinaRica' => ['iron' => 0.10],
        'rio' => ['gold' => 0.10],
    ],
];
