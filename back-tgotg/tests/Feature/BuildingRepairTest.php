<?php

use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

function createPlayerWithCity(array $cityOverrides = []): array
{
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);

    // Los recursos viven en el jugador; los overrides de recursos van a su fila.
    $resourceKeys = ['gold', 'wood', 'stone', 'iron', 'food'];
    $playerResources = array_intersect_key($cityOverrides, array_flip($resourceKeys));
    $player = Player::factory()->create(array_merge([
        'world_id' => $world->id,
        'user_id' => $user->id,
        'gold' => 10000,
        'wood' => 5000,
        'stone' => 5000,
        'iron' => 5000,
        'food' => 5000,
    ], $playerResources));

    $city = City::factory()->create(array_merge([
        'player_id' => $player->id,
        'world_id' => $world->id,
    ], array_diff_key($cityOverrides, array_flip($resourceKeys))));

    return [$user, $world, $player, $city];
}

function createDamagedBuilding(City $city, array $overrides = [], ?BuildingType $type = null): Building
{
    return Building::factory()->create(array_merge([
        'city_id' => $city->id,
        'building_type_id' => $type?->id ?? BuildingType::factory()->create()->id,
        'level' => 1,
    ], $overrides));
}

test('reparar un edificio requiere autenticación', function () {
    $building = Building::factory()->create(['damage' => 20]);

    $this->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'paid'])
        ->assertStatus(401);
});

test('no se puede reparar un edificio de otro jugador', function () {
    [$user] = createPlayerWithCity();
    $foreign = Building::factory()->create(['damage' => 20]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$foreign->id}/repair", ['type' => 'paid'])
        ->assertStatus(403);
});

test('reparar un edificio sin daños devuelve error', function () {
    [$user, , , $city] = createPlayerWithCity();
    $building = createDamagedBuilding($city, ['level' => 2]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'paid'])
        ->assertStatus(422);
});

test('la reparación pagada descuenta oro y material y marca la reparación', function () {
    [$user, , $player, $city] = createPlayerWithCity();
    $type = BuildingType::factory()->create([
        'key' => 'muralla',
        'repair_material' => 'stone',
    ]);
    $building = createDamagedBuilding($city, ['level' => 2, 'damage' => 50], $type);

    // HP muralla L2 = 2 × 1000 × 1,5 = 3000 → 50 % = 1500 puntos → 4500 oro + 1500 piedra
    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'paid'])
        ->assertStatus(200)
        ->assertJsonPath('building.repairing', true)
        ->assertJsonPath('building.repairPaid', true);

    $player->refresh();
    expect($player->gold)->toBe(5500);
    expect($player->stone)->toBe(3500);

    $building->refresh();
    expect($building->repair_paid)->toBeTrue();
    expect($building->repair_started_at)->not->toBeNull();
});

test('la reparación pagada sin recursos suficientes falla', function () {
    [$user, , , $city] = createPlayerWithCity(['gold' => 100]);
    $type = BuildingType::factory()->create([
        'key' => 'muralla',
        'repair_material' => 'stone',
    ]);
    $building = createDamagedBuilding($city, ['level' => 2, 'damage' => 50], $type);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'paid'])
        ->assertStatus(422);
});

test('la reparación automática es gratuita y lenta', function () {
    [$user, , $player, $city] = createPlayerWithCity();
    $building = createDamagedBuilding($city, ['damage' => 30]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'auto'])
        ->assertStatus(200)
        ->assertJsonPath('building.repairPaid', false);

    $player->refresh();
    expect($player->gold)->toBe(10000);

    $building->refresh();
    expect($building->repair_paid)->toBeFalse();
});

test('no se puede encolar una segunda reparación', function () {
    [$user, , , $city] = createPlayerWithCity();
    $building = createDamagedBuilding($city, [
        'damage' => 30,
        'repair_started_at' => now(),
        'repair_paid' => true,
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'paid'])
        ->assertStatus(409);
});

test('el tipo de reparación debe ser válido', function () {
    [$user, , , $city] = createPlayerWithCity();
    $building = createDamagedBuilding($city, ['damage' => 30]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/city/buildings/{$building->id}/repair", ['type' => 'exprés'])
        ->assertStatus(422);
});

test('la reparación pagada avanza rápido y la automática lento', function () {
    [$user, , , $city] = createPlayerWithCity();

    $paidBuilding = createDamagedBuilding($city, [
        'damage' => 50,
        'repair_started_at' => now()->subHours(2),
        'repair_paid' => true,
    ], BuildingType::factory()->create(['name' => 'Granja']));
    $autoBuilding = createDamagedBuilding($city, [
        'damage' => 50,
        'repair_started_at' => now()->subHours(2),
        'repair_paid' => false,
    ], BuildingType::factory()->create(['name' => 'Muralla']));

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/city')
        ->assertStatus(200)
        ->assertJsonPath('city.buildings.0.damage', 30)
        ->assertJsonPath('city.buildings.0.repairing', true)
        ->assertJsonPath('city.buildings.1.damage', 47)
        ->assertJsonPath('city.buildings.1.repairing', true);

    $paidBuilding->refresh();
    $autoBuilding->refresh();
    expect($paidBuilding->damage)->toBe(30);
    expect($autoBuilding->damage)->toBe(47);
});

test('la reparación finalizada se limpia al consultar la ciudad', function () {
    Carbon::setTestNow(now()->startOfDay());

    [$user, , , $city] = createPlayerWithCity();

    $building = createDamagedBuilding($city, [
        'damage' => 10,
        'repair_started_at' => now()->subHour(),
        'repair_paid' => true,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/city')
        ->assertStatus(200)
        ->assertJsonPath('city.buildings.0.damage', 0)
        ->assertJsonPath('city.buildings.0.repairing', false);

    $building->refresh();
    expect($building->damage)->toBe(0);
    expect($building->repair_started_at)->toBeNull();

    Carbon::setTestNow();
});
