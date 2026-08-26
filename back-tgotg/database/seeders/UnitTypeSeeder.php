<?php

namespace Database\Seeders;

use App\Models\Civilization;
use App\Models\UnitType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the initial unit types.
     *
     * Cada civilización usa únicamente sus propios tipos de unidad
     * (columna civilization_id; null = unidad neutral compartida).
     * Cada unidad requiere un cuartel del nivel indicado en
     * required_barracks_level y consume comida por hora mientras existe.
     */
    public function run(): void
    {
        $humanos = Civilization::where('key', 'humanos')->firstOrFail();
        $unitTypes = [
            [
                'key' => 'miliciano',
                'name' => 'Miliciano',
                'tier' => 1,
                'description' => 'Campesino armado con lo que encuentra. Barato y numeroso.',
                'attack' => 25,
                'defense' => 25,
                'gold_cost' => 50,
                'food_cost' => 20,
                'iron_cost' => 10,
                'food_upkeep' => 0.2,
                'training_minutes' => 5,
                'required_barracks_level' => 1,
            ],
            [
                'key' => 'espadachin',
                'name' => 'Espadachín',
                'tier' => 2,
                'description' => 'Soldado profesional con espada y escudo. El pilar de cualquier ejército.',
                'attack' => 50,
                'defense' => 55,
                'gold_cost' => 120,
                'food_cost' => 35,
                'iron_cost' => 25,
                'food_upkeep' => 0.4,
                'training_minutes' => 10,
                'required_barracks_level' => 2,
            ],
            [
                'key' => 'arquero',
                'name' => 'Arquero',
                'tier' => 3,
                'description' => 'Letal desde la distancia, excelente defensor de murallas.',
                'attack' => 85,
                'defense' => 95,
                'gold_cost' => 260,
                'food_cost' => 60,
                'iron_cost' => 55,
                'food_upkeep' => 0.7,
                'training_minutes' => 20,
                'required_barracks_level' => 3,
            ],
            [
                'key' => 'caballero',
                'name' => 'Caballero',
                'tier' => 4,
                'description' => 'Guerrero montado que rompe líneas enemigas con su carga.',
                'attack' => 180,
                'defense' => 130,
                'gold_cost' => 550,
                'food_cost' => 110,
                'iron_cost' => 120,
                'food_upkeep' => 1.2,
                'training_minutes' => 40,
                'required_barracks_level' => 4,
            ],
            [
                'key' => 'campeon',
                'name' => 'Campeón',
                'tier' => 5,
                'description' => 'El guerrero más letal de la contienda, vestido en armadura completa.',
                'attack' => 380,
                'defense' => 300,
                'gold_cost' => 1100,
                'food_cost' => 200,
                'iron_cost' => 260,
                'food_upkeep' => 2.0,
                'training_minutes' => 80,
                'required_barracks_level' => 5,
            ],
        ];

        foreach ($unitTypes as $unitType) {
            $unitType['civilization_id'] = $humanos->id;

            UnitType::updateOrCreate(['key' => $unitType['key']], $unitType);
        }
    }
}
