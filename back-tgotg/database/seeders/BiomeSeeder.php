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
            ['key' => 'pradera', 'bonus_resource' => 'food', 'bonus_value' => 0.10],
            ['key' => 'bosque', 'bonus_resource' => 'wood', 'bonus_value' => 0.10],
            ['key' => 'montaña', 'bonus_resource' => 'stone', 'bonus_value' => 0.10],
            ['key' => 'colinaRica', 'bonus_resource' => 'iron', 'bonus_value' => 0.10],
            ['key' => 'costa', 'bonus_resource' => 'gold', 'bonus_value' => 0.10],
        ];

        foreach ($biomes as $data) {
            Biome::updateOrCreate(['key' => $data['key']], $data);
        }
    }
}
