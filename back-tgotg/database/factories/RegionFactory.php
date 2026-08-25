<?php

namespace Database\Factories;

use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Region>
 */
class RegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => fake()->unique()->lexify('region???'),
            'label' => fake()->city(),
            'polygon' => [100, 100, 400, 100, 400, 300, 100, 300],
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
