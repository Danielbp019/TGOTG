<?php

namespace Database\Factories;

use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Player>
 */
class PlayerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'world_id' => World::factory(),
            'user_id' => User::factory(),
            'civilization_id' => null,
            'blessing_id' => null,
            'gold' => 0,
            'wood' => 0,
            'stone' => 0,
            'iron' => 0,
            'food' => 0,
        ];
    }
}
