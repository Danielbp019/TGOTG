<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Player;
use App\Models\World;

trait ResolvesCurrentPlayer
{
    protected function currentWorld(): ?World
    {
        return World::where('status', 'running')
            ->latest('started_at')
            ->first();
    }

    protected function currentPlayer(string $userId): ?Player
    {
        $world = $this->currentWorld();

        if ($world === null) {
            return null;
        }

        return Player::where('world_id', $world->id)
            ->where('user_id', $userId)
            ->first();
    }
}
