<?php

namespace Database\Factories;

use App\Models\Biome;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Biome>
 */
class BiomeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->lexify('biome???'),
            'bonus_resource' => fake()->randomElement(['food', 'wood', 'stone', 'iron', 'gold']),
            'bonus_value' => 0.10,
        ];
    }
}
