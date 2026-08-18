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
     */
    public function run(): void
    {
        $buildingTypes = [
            ['key' => 'ayuntamiento', 'name' => 'Ayuntamiento', 'category' => 'Principal'],
            ['key' => 'muralla', 'name' => 'Muralla', 'category' => 'Defensa'],
            ['key' => 'foso', 'name' => 'Foso', 'category' => 'Defensa'],
            ['key' => 'granja', 'name' => 'Granja', 'category' => 'Recursos'],
            ['key' => 'minaHierro', 'name' => 'Mina de hierro', 'category' => 'Recursos'],
            ['key' => 'minaPiedra', 'name' => 'Mina de piedra', 'category' => 'Recursos'],
            ['key' => 'aserradero', 'name' => 'Aserradero', 'category' => 'Recursos'],
            ['key' => 'cuartel', 'name' => 'Cuartel del ejército', 'category' => 'Militar'],
            ['key' => 'laboratorio', 'name' => 'Laboratorio', 'category' => 'Investigación'],
        ];

        foreach ($buildingTypes as $buildingType) {
            BuildingType::firstOrCreate(['key' => $buildingType['key']], $buildingType);
        }
    }
}
