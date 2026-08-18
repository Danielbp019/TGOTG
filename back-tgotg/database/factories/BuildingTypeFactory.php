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
        ];
    }
}
