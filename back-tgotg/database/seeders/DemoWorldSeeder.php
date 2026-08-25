<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\User;
use App\Models\UserStatistic;
use App\Models\World;
use App\Support\StartingConfig;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoWorldSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed a running demo world for the admin account.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['nick' => 'Dios Supremo', 'password' => Hash::make('password')]
        );
        $admin->forceFill(['role' => 'admin'])->save();

        if (World::where('status', 'running')->exists()) {
            return;
        }

        $world = World::create([
            'status' => 'running',
            'duration_days' => 30,
            'speed_multiplier' => 1,
            'started_at' => now(),
            'ended_at' => now()->addDays(30),
            'created_by' => $admin->id,
        ]);

        Player::create([
            'world_id' => $world->id,
            'user_id' => $admin->id,
            'gold' => StartingConfig::cityValues()['gold'],
            'wood' => StartingConfig::cityValues()['wood'],
            'stone' => StartingConfig::cityValues()['stone'],
            'iron' => StartingConfig::cityValues()['iron'],
            'food' => StartingConfig::cityValues()['food'],
        ]);

        UserStatistic::firstOrCreate(
            ['user_id' => $admin->id],
            ['games_played' => 0]
        );
    }
}
