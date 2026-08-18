<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Player;
use App\Models\World;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'player_id' => Player::factory(),
            'world_id' => World::factory(),
            'name' => fake()->city(),
            'gold' => 0,
            'wood' => 0,
            'stone' => 0,
            'iron' => 0,
            'food' => 0,
            'gold_per_hour' => 0,
            'wood_per_hour' => 0,
            'stone_per_hour' => 0,
            'iron_per_hour' => 0,
            'food_per_hour' => 0,
            'gold_consumption_per_hour' => 0,
            'wood_consumption_per_hour' => 0,
            'stone_consumption_per_hour' => 0,
            'iron_consumption_per_hour' => 0,
            'food_consumption_per_hour' => 0,
            'population' => fake()->numberBetween(0, 1000),
            'happiness' => fake()->numberBetween(0, 100),
            'defense' => 0,
            'stationed_troops' => 0,
            'defense_power' => 0,
        ];
    }
}
