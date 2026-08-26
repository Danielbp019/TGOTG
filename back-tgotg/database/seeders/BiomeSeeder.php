<?php

namespace Database\Seeders;

use App\Models\Biome;
use Illuminate\Database\Seeder;

class BiomeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $biomes = [
            [
                'key' => 'pradera',
                'label' => 'Pradera',
                'description' => 'Llanuras fértiles ideales para granjas y pastos.',
                'bonus_resource' => 'food',
                'bonus_value' => 0.10,
            ],
            [
                'key' => 'bosque',
                'label' => 'Bosque',
                'description' => 'Espesura interminable de robles y pinos.',
                'bonus_resource' => 'wood',
                'bonus_value' => 0.10,
            ],
            [
                'key' => 'montaña',
                'label' => 'Montaña',
                'description' => 'Picos rocosos ricos en canteras.',
                'bonus_resource' => 'stone',
                'bonus_value' => 0.10,
            ],
            [
                'key' => 'colinaRica',
                'label' => 'Colina rica',
                'description' => 'Vetas profundas de mineral bajo las colinas.',
                'bonus_resource' => 'iron',
                'bonus_value' => 0.10,
            ],
            [
                'key' => 'costa',
                'label' => 'Costa',
                'description' => 'Costas prósperas que atraen comercio y tributos.',
                'bonus_resource' => 'gold',
                'bonus_value' => 0.10,
            ],
        ];

        foreach ($biomes as $data) {
            Biome::updateOrCreate(['key' => $data['key']], $data);
        }
    }
}
