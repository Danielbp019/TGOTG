<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;
use App\Models\World;

class ConversationPolicy
{
    public function participate(User $user, Conversation $conversation): bool
    {
        $worldId = World::where('status', 'running')
            ->latest('started_at')
            ->value('id');

        if ($conversation->world_id !== $worldId) {
            return false;
        }

        return in_array($user->id, [$conversation->user_one_id, $conversation->user_two_id], true);
    }
}
