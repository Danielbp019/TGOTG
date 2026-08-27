<?php

namespace App\Jobs;

use App\Models\ClanMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CleanClanMessages implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $retentionDays = config('game_balance.clan.chat_retention_days', 7);

        ClanMessage::where('created_at', '<', now()->subDays($retentionDays))
            ->delete();
    }
}
