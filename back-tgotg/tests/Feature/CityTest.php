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
    $city = City::factory()->create();

    $this->getJson("/api/cities/{$city->id}")->assertStatus(401);
});

test('un usuario sin jugador no tiene ciudad', function () {
    $user = User::factory()->create();
    $city = City::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(404);
});

test('un jugador sin ciudad tampoco tiene datos', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $city = City::factory()->create(['world_id' => $world->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(403);
});

test('devuelve la ciudad del jugador actual con sus edificios', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $player = Player::factory()->create([
        'world_id' => $world->id,
        'user_id' => $user->id,
        'gold' => 12450,
        'wood' => 8300,
        'stone' => 6200,
        'iron' => 4100,
        'food' => 9700,
    ]);
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'name' => 'Principal',
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
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(200)
        ->assertJsonPath('city.name', 'Principal')
        ->assertJsonPath('city.resources.gold', 12450)
        ->assertJsonPath('city.resources.food', 9700)
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
        ->assertJsonPath('city.buildings.0.height', 320)
        // Sin daño no hay costo de reparación.
        ->assertJsonPath('city.buildings.0.repairCost', null);
});

test('el payload incluye el material y costo de reparación de un edificio dañado', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $player = Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
    ]);
    $buildingType = BuildingType::factory()->create([
        'key' => 'muralla',
        'repair_material' => 'stone',
    ]);
    Building::factory()->create([
        'city_id' => $city->id,
        'building_type_id' => $buildingType->id,
        'level' => 2,
        'damage' => 50,
    ]);

    // HP = 2 × 1000 × 1,5 (defensivo) = 3000; puntos = 50 % de 3000 = 1500.
    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(200)
        ->assertJsonPath('city.buildings.0.repairMaterial', 'stone')
        ->assertJsonPath('city.buildings.0.repairCost.gold', 4500)
        ->assertJsonPath('city.buildings.0.repairCost.material', 'stone')
        ->assertJsonPath('city.buildings.0.repairCost.amount', 1500);
});

test('los recursos del payload de ciudad son los generales del jugador', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $player = Player::factory()->create([
        'world_id' => $world->id,
        'user_id' => $user->id,
        'gold' => 777,
        'wood' => 555,
    ]);
    // La ciudad tiene columnas de recursos propias que deben ignorarse.
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'gold' => 123456,
        'wood' => 654321,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(200)
        ->assertJsonPath('city.resources.gold', 777)
        ->assertJsonPath('city.resources.wood', 555);
});

test('la producción horaria aplica el multiplicador de velocidad del mundo', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running', 'speed_multiplier' => 2]);
    $player = Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'gold_per_hour' => 120,
        'wood_per_hour' => 85,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(200)
        ->assertJsonPath('city.perHour.gold', 240)
        ->assertJsonPath('city.perHour.wood', 170);
});
