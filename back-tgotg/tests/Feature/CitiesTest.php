<?php

use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('la ciudad concreta requiere autenticación', function () {
    $this->getJson('/api/cities/00000000-0000-0000-0000-000000000000')->assertStatus(401);
});

test('un usuario sin jugador no puede ver ninguna ciudad', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $other = Player::factory()->create(['world_id' => $world->id]);
    $city = City::factory()->create(['player_id' => $other->id, 'world_id' => $world->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(404);
});

test('no permite ver la ciudad de otro jugador', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $other = Player::factory()->create(['world_id' => $world->id]);
    $city = City::factory()->create([
        'player_id' => $other->id,
        'world_id' => $world->id,
        'name' => 'Ajena',
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(403);
});

test('devuelve la ciudad propia con su payload completo', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $player = Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'name' => 'Segunda',
        'gold' => 500,
        'gold_per_hour' => 100,
    ]);
    $buildingType = BuildingType::factory()->create([
        'key' => 'ayuntamiento',
        'name' => 'Ayuntamiento',
        'category' => 'Principal',
    ]);
    Building::factory()->create([
        'city_id' => $city->id,
        'building_type_id' => $buildingType->id,
        'level' => 2,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(200)
        ->assertJsonPath('city.name', 'Segunda')
        ->assertJsonPath('city.resources.gold', 500)
        ->assertJsonPath('city.perHour.gold', 100)
        ->assertJsonCount(1, 'city.buildings')
        ->assertJsonPath('city.buildings.0.key', 'ayuntamiento')
        ->assertJsonPath('city.buildings.0.level', 2);
});
