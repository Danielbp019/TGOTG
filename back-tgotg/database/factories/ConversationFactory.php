<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\User;
use App\Models\World;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
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
            'user_one_id' => User::factory(),
            'user_two_id' => User::factory(),
            'last_message_at' => null,
        ];
    }
}
