<?php

namespace App\Console\Commands;

use App\Jobs\CleanClanMessages;
use Illuminate\Console\Command;

class CleanClanMessagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clan:clean-messages';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean old clan chat messages based on retention policy';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        CleanClanMessages::dispatchSync();

        $this->info('Clan messages cleaned successfully.');

        return self::SUCCESS;
    }
}
