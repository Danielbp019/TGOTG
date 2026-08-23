<?php

namespace App\Policies;

use App\Models\Building;
use App\Models\Player;
use App\Models\User;
use App\Models\World;

class BuildingPolicy
{
    public function manage(User $user, Building $building): bool
    {
        $worldId = World::where('status', 'running')
            ->latest('started_at')
            ->value('id');

        if ($worldId === null) {
            return false;
        }

        $city = $building->city;

        if ($city === null || $city->world_id !== $worldId) {
            return false;
        }

        return Player::where('id', $city->player_id)
            ->where('user_id', $user->id)
            ->exists();
    }
}
