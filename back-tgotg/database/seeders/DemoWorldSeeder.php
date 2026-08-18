<?php

namespace Database\Seeders;

use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\User;
use App\Models\UserStatistic;
use App\Models\World;
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
            ['nick' => 'Dios Supremo', 'role' => 'admin', 'password' => Hash::make('password')]
        );

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

        $player = Player::create([
            'world_id' => $world->id,
            'user_id' => $admin->id,
            'gold' => 12450,
            'wood' => 8300,
            'stone' => 6200,
            'iron' => 4100,
            'food' => 9700,
        ]);

        $city = City::create([
            'player_id' => $player->id,
            'world_id' => $world->id,
            'name' => 'Principal',
            'gold' => 12450,
            'wood' => 8300,
            'stone' => 6200,
            'iron' => 4100,
            'food' => 9700,
            'gold_per_hour' => 120,
            'wood_per_hour' => 85,
            'stone_per_hour' => 60,
            'iron_per_hour' => 35,
            'food_per_hour' => 95,
            'population' => 340,
            'happiness' => 72,
            'defense' => 58,
            'stationed_troops' => 124,
            'defense_power' => 310,
        ]);

        $buildings = [
            ['key' => 'foso', 'level' => 1, 'x' => 1024, 'y' => 910, 'shape' => 'rect', 'width' => 1800, 'height' => 160],
            ['key' => 'muralla', 'level' => 2, 'x' => 1024, 'y' => 690, 'shape' => 'rect', 'width' => 1750, 'height' => 200],
            ['key' => 'minaPiedra', 'level' => 1, 'x' => 520, 'y' => 480, 'shape' => 'diamond', 'width' => 480, 'height' => 250],
            ['key' => 'ayuntamiento', 'level' => 3, 'x' => 960, 'y' => 470, 'shape' => 'diamond', 'width' => 500, 'height' => 260],
            ['key' => 'minaHierro', 'level' => 2, 'x' => 1420, 'y' => 490, 'shape' => 'diamond', 'width' => 510, 'height' => 260],
            ['key' => 'cuartel', 'level' => 1, 'x' => 640, 'y' => 260, 'shape' => 'diamond', 'width' => 490, 'height' => 250],
            ['key' => 'laboratorio', 'level' => 0, 'x' => 1080, 'y' => 220, 'shape' => 'diamond', 'width' => 500, 'height' => 260],
            ['key' => 'aserradero', 'level' => 2, 'x' => 1500, 'y' => 240, 'shape' => 'diamond', 'width' => 480, 'height' => 250],
            ['key' => 'granja', 'level' => 2, 'x' => 1620, 'y' => 360, 'shape' => 'diamond', 'width' => 490, 'height' => 250],
        ];

        foreach ($buildings as $building) {
            Building::create([
                'city_id' => $city->id,
                'building_type_id' => BuildingType::where('key', $building['key'])->value('id'),
                'level' => $building['level'],
                'shape' => $building['shape'],
                'x' => $building['x'],
                'y' => $building['y'],
                'width' => $building['width'],
                'height' => $building['height'],
            ]);
        }

        UserStatistic::firstOrCreate(
            ['user_id' => $admin->id],
            ['games_played' => 0]
        );
    }
}
