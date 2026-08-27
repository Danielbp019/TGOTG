<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;

trait HasUserPayload
{
    /**
     * @return array{id: string, nick: string, email: string, role: string}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'nick' => $user->nick,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}
