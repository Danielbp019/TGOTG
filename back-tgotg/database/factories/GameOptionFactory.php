<?php

namespace Database\Factories;

use App\Models\GameOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameOption>
 */
class GameOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => GameOption::TYPE_DURATION,
            'key' => fake()->unique()->word(),
            'label' => fake()->word(),
            'value' => fake()->numberBetween(1, 90),
            'description' => fake()->sentence(),
            'sort_order' => 0,
        ];
    }
}
