<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['nick' => 'Dios Supremo', 'password' => Hash::make('password')]
        )->forceFill(['role' => 'admin'])->save();

        $this->call([
            CivilizationSeeder::class,
            BlessingSeeder::class,
            BuildingTypeSeeder::class,
            UnitTypeSeeder::class,
            GameOptionSeeder::class,
            DemoWorldSeeder::class,
            DemoMessagesSeeder::class,
        ]);
    }
}
