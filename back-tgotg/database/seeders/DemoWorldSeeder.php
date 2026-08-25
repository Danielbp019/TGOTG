<?php

namespace Database\Seeders;

use App\Models\Biome;
use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\Region;
use App\Models\User;
use App\Models\UserStatistic;
use App\Models\World;
use App\Support\CityLayouts;
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

        $player = Player::create([
            'world_id' => $world->id,
            'user_id' => $admin->id,
            'gold' => 12450,
            'wood' => 8300,
            'stone' => 6200,
            'iron' => 4100,
            'food' => 9700,
        ]);

        $region = Region::firstOrCreate(
            ['key' => 'region1'],
            ['label' => 'Región 1', 'polygon' => [100, 100, 400, 100, 400, 300, 100, 300], 'sort_order' => 1]
        );
        $biome = Biome::firstOrCreate(
            ['key' => 'bosque'],
            ['bonus_resource' => 'wood', 'bonus_value' => 0.10]
        );

        if (! $region->biomes()->where('biomes.id', $biome->id)->exists()) {
            $region->biomes()->syncWithoutDetaching([$biome->id]);
        }

        $city = City::create(StartingConfig::cityValues() + [
            'player_id' => $player->id,
            'world_id' => $world->id,
            'region_id' => $region->id,
            'biome_id' => $biome->id,
        ]);

        foreach (CityLayouts::plots() as $building) {
            Building::create([
                'city_id' => $city->id,
                'building_type_id' => BuildingType::where('key', $building['key'])->value('id'),
                'level' => $building['key'] === 'ayuntamiento' ? 1 : 0,
            ]);
        }

        UserStatistic::firstOrCreate(
            ['user_id' => $admin->id],
            ['games_played' => 0]
        );
    }
}
