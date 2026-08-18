<?php

namespace Database\Factories;

use App\Models\Civilization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Civilization>
 */
class CivilizationFactory extends Factory
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
            'description' => fake()->sentence(),
            'benefit' => fake()->sentence(),
            'bonus' => ['production_bonus' => ['food' => 10]],
        ];
    }
}
