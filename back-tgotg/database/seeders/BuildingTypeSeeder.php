<?php

namespace Database\Seeders;

use App\Models\BuildingType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BuildingTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the initial building types.
     *
     * Los costos de materiales son los del nivel 1; cada nivel multiplica
     * por config('game_balance.building.material_growth_factor').
     * El oro es fijo por edificio (sueldo de los trabajadores).
     */
    public function run(): void
    {
        $buildingTypes = [
            [
                'key' => 'ayuntamiento',
                'name' => 'Ayuntamiento',
                'category' => 'Principal',
                'description' => 'El corazón de la ciudad. Gobierna el asentamiento, amplía su población y recauda más oro.',
                'gold_cost' => 4000,
                'wood_cost' => 800,
                'stone_cost' => 600,
                'iron_cost' => 200,
                'base_minutes' => 120,
                'repair_material' => 'stone',
            ],
            [
                'key' => 'muralla',
                'name' => 'Muralla',
                'category' => 'Defensa',
                'description' => 'Fortifica la ciudad y eleva su defensa frente a los asedios.',
                'gold_cost' => 3000,
                'wood_cost' => 600,
                'stone_cost' => 1000,
                'iron_cost' => 150,
                'base_minutes' => 90,
                'repair_material' => 'stone',
            ],
            [
                'key' => 'foso',
                'name' => 'Foso',
                'category' => 'Defensa',
                'description' => 'Dificulta los ataques enemigos y debilita a quienes intenten asaltar tus muros.',
                'gold_cost' => 2500,
                'wood_cost' => 400,
                'stone_cost' => 800,
                'iron_cost' => 100,
                'base_minutes' => 60,
                'repair_material' => 'stone',
            ],
            [
                'key' => 'granja',
                'name' => 'Granja',
                'category' => 'Recursos',
                'description' => 'Produce comida para alimentar a tu población y sostener a tu ejército.',
                'gold_cost' => 1500,
                'wood_cost' => 600,
                'stone_cost' => 100,
                'iron_cost' => 0,
                'base_minutes' => 45,
                'repair_material' => 'wood',
            ],
            [
                'key' => 'minaHierro',
                'name' => 'Mina de hierro',
                'category' => 'Recursos',
                'description' => 'Extrae hierro, el material imprescindible para entrenar y equipar a tus tropas.',
                'gold_cost' => 2000,
                'wood_cost' => 700,
                'stone_cost' => 300,
                'iron_cost' => 150,
                'base_minutes' => 45,
                'repair_material' => 'iron',
            ],
            [
                'key' => 'minaPiedra',
                'name' => 'Mina de piedra',
                'category' => 'Recursos',
                'description' => 'Extrae piedra, clave para las construcciones y las defensas.',
                'gold_cost' => 1500,
                'wood_cost' => 500,
                'stone_cost' => 300,
                'iron_cost' => 100,
                'base_minutes' => 45,
                'repair_material' => 'stone',
            ],
            [
                'key' => 'aserradero',
                'name' => 'Aserradero',
                'category' => 'Recursos',
                'description' => 'Produce madera, la base de casi toda construcción.',
                'gold_cost' => 1500,
                'wood_cost' => 800,
                'stone_cost' => 100,
                'iron_cost' => 50,
                'base_minutes' => 45,
                'repair_material' => 'wood',
            ],
            [
                'key' => 'cuartel',
                'name' => 'Cuartel del ejército',
                'category' => 'Militar',
                'description' => 'Entrena y aloja a tus tropas, tu garantía para defender y atacar.',
                'gold_cost' => 3000,
                'wood_cost' => 700,
                'stone_cost' => 400,
                'iron_cost' => 300,
                'base_minutes' => 60,
                'repair_material' => 'iron',
            ],
            [
                'key' => 'laboratorio',
                'name' => 'Laboratorio',
                'category' => 'Investigación',
                'description' => 'El centro de la investigación, donde se desbloquean nuevas tecnologías y mejoras.',
                'gold_cost' => 3500,
                'wood_cost' => 600,
                'stone_cost' => 500,
                'iron_cost' => 400,
                'base_minutes' => 90,
                'repair_material' => 'iron',
            ],
        ];

        foreach ($buildingTypes as $buildingType) {
            BuildingType::updateOrCreate(['key' => $buildingType['key']], $buildingType);
        }
    }
}
