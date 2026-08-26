<?php

namespace Database\Factories;

use App\Models\Civilization;
use App\Models\UnitType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UnitType>
 */
class UnitTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'civilization_id' => Civilization::factory(),
            'key' => fake()->unique()->word(),
            'name' => fake()->unique()->word(),
            'tier' => fake()->numberBetween(1, 5),
            'description' => fake()->sentence(),
            'attack' => fake()->numberBetween(10, 400),
            'defense' => fake()->numberBetween(10, 400),
            'gold_cost' => fake()->numberBetween(50, 1200),
            'food_cost' => fake()->numberBetween(20, 250),
            'iron_cost' => fake()->numberBetween(10, 300),
            'food_upkeep' => fake()->randomFloat(1, 0.2, 2),
            'training_minutes' => fake()->numberBetween(5, 90),
            'required_barracks_level' => fake()->numberBetween(1, 5),
        ];
    }
}
