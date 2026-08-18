<?php

namespace Database\Factories;

use App\Models\Blessing;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Blessing>
 */
class BlessingFactory extends Factory
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
            'benefit' => fake()->sentence(3),
            'description' => fake()->sentence(),
        ];
    }
}
