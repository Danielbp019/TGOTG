<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserStatistic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserStatistic>
 */
class UserStatisticFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'games_played' => 0,
            'most_used_blessing_id' => null,
            'most_played_civilization_id' => null,
        ];
    }
}
