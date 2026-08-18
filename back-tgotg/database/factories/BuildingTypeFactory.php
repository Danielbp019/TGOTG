<?php

namespace Database\Factories;

use App\Models\BuildingType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BuildingType>
 */
class BuildingTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->word(),
            'name' => fake()->unique()->word(),
            'category' => fake()->randomElement(['Principal', 'Defensa', 'Recursos', 'Militar', 'Investigación']),
            'gold_cost' => fake()->numberBetween(500, 4000),
            'wood_cost' => fake()->numberBetween(100, 1000),
            'stone_cost' => fake()->numberBetween(100, 1000),
            'iron_cost' => fake()->numberBetween(0, 400),
            'base_minutes' => fake()->numberBetween(30, 120),
            'repair_material' => fake()->randomElement(['wood', 'stone', 'iron']),
        ];
    }
}
