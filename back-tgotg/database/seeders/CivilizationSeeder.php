<?php

namespace Database\Seeders;

use App\Models\Civilization;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CivilizationSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the initial civilizations.
     */
    public function run(): void
    {
        $civilizations = [
            ['key' => 'iberia', 'name' => 'Iberia', 'description' => 'Una civilización orgullosa, experta en comercio y en la extracción de metales.'],
            ['key' => 'vikinga', 'name' => 'Vikinga', 'description' => 'Guerreros del norte que dominan el asalto y prosperan con el saqueo.'],
            ['key' => 'egipcia', 'name' => 'Egipcia', 'description' => 'Heredera del Nilo, maestra en las construcciones monumentales y la agricultura.'],
            ['key' => 'samurai', 'name' => 'Samurái', 'description' => 'El código del honor guía a sus tropas, implacables en la defensa.'],
        ];

        foreach ($civilizations as $civilization) {
            Civilization::firstOrCreate(['key' => $civilization['key']], $civilization);
        }
    }
}
