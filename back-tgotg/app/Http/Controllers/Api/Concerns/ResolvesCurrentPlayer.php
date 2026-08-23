<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Player;
use App\Models\World;

trait ResolvesCurrentPlayer
{
    protected ?World $resolvedWorld = null;

    protected bool $worldResolved = false;

    protected function currentWorld(): ?World
    {
        if (! $this->worldResolved) {
            $this->resolvedWorld = World::where('status', 'running')
                ->latest('started_at')
                ->first();

            $this->worldResolved = true;
        }

        return $this->resolvedWorld;
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
