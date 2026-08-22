<?php

use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('la ciudad requiere autenticación', function () {
    $this->getJson('/api/city')->assertStatus(401);
});

test('un usuario sin jugador no tiene ciudad', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/city')
        ->assertStatus(404);
});

test('un jugador sin ciudad tampoco tiene datos', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/city')
        ->assertStatus(404);
});

test('devuelve la ciudad del jugador actual con sus edificios', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $player = Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'name' => 'Principal',
        'gold' => 12450,
        'gold_per_hour' => 120,
        'population' => 340,
        'happiness' => 72,
        'defense' => 58,
        'stationed_troops' => 124,
        'defense_power' => 310,
    ]);
    $buildingType = BuildingType::factory()->create([
        'key' => 'ayuntamiento',
        'name' => 'Ayuntamiento',
        'category' => 'Principal',
    ]);
    Building::factory()->create([
        'city_id' => $city->id,
        'building_type_id' => $buildingType->id,
        'level' => 3,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/city')
        ->assertStatus(200)
        ->assertJsonPath('city.name', 'Principal')
        ->assertJsonPath('city.resources.gold', 12450)
        ->assertJsonPath('city.perHour.gold', 120)
        ->assertJsonPath('city.population', 340)
        ->assertJsonPath('city.happiness', 72)
        ->assertJsonPath('city.defense', 58)
        ->assertJsonPath('city.stationedTroops', 124)
        ->assertJsonPath('city.defensePower', 310)
        ->assertJsonCount(1, 'city.buildings')
        ->assertJsonPath('city.buildings.0.key', 'ayuntamiento')
        ->assertJsonPath('city.buildings.0.level', 3)
        ->assertJsonPath('city.buildings.0.shape', 'diamond')
        ->assertJsonPath('city.buildings.0.x', 970)
        ->assertJsonPath('city.buildings.0.y', 290)
        ->assertJsonPath('city.buildings.0.width', 340)
        ->assertJsonPath('city.buildings.0.height', 340);
});

test('la producción horaria aplica el multiplicador de velocidad del mundo', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running', 'speed_multiplier' => 2]);
    $player = Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'gold_per_hour' => 120,
        'wood_per_hour' => 85,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/city')
        ->assertStatus(200)
        ->assertJsonPath('city.perHour.gold', 240)
        ->assertJsonPath('city.perHour.wood', 170);
});
