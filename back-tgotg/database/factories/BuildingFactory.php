<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Building>
 */
class BuildingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'city_id' => City::factory(),
            'building_type_id' => BuildingType::factory(),
            'level' => fake()->numberBetween(0, 5),
        ];
    }
}
