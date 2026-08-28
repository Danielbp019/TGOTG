<?php

use App\Models\Biome;
use App\Models\Building;
use App\Models\BuildingType;
use App\Models\City;
use App\Models\Player;
use App\Models\Region;
use App\Models\User;
use App\Models\World;
use App\Support\CityLayouts;
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
    $player = Player::factory()->create([
        'world_id' => $world->id,
        'user_id' => $user->id,
        'gold' => 900,
    ]);
    $city = City::factory()->create([
        'player_id' => $player->id,
        'world_id' => $world->id,
        'name' => 'Segunda',
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
        ->assertJsonPath('city.resources.gold', 900)
        ->assertJsonPath('city.perHour.gold', 100)
        ->assertJsonCount(1, 'city.buildings')
        ->assertJsonPath('city.buildings.0.key', 'ayuntamiento')
        ->assertJsonPath('city.buildings.0.level', 2);
});

test('crear una ciudad arranca con el ayuntamiento nivel 1 y el resto en nivel 0', function () {
    $user = User::factory()->create();
    World::factory()->create(['status' => 'running']);

    $region = Region::factory()->create();
    $biome = Biome::factory()->create();
    $region->biomes()->attach($biome->id);

    foreach (CityLayouts::plots() as $plot) {
        BuildingType::factory()->create(['key' => $plot['key']]);
    }

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/cities', [
            'name' => 'Principal',
            'region_id' => $region->id,
            'biome_id' => $biome->id,
        ])
        ->assertStatus(201);

    $player = Player::where('user_id', $user->id)->firstOrFail();
    $buildings = Building::where('city_id', $player->cities->first()->id)->get();

    expect($buildings)->toHaveCount(count(CityLayouts::plots()));

    foreach ($buildings as $building) {
        $expectedLevel = $building->buildingType->key === 'ayuntamiento' ? 1 : 0;
        expect($building->level)->toBe($expectedLevel);
    }
});

test('una ciudad recien creada tiene atributos coherentes con sus edificios', function () {
    $user = User::factory()->create();
    World::factory()->create(['status' => 'running']);

    $region = Region::factory()->create();
    $biome = Biome::factory()->create();
    $region->biomes()->attach($biome->id);

    foreach (CityLayouts::plots() as $plot) {
        BuildingType::factory()->create(['key' => $plot['key']]);
    }

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/cities', [
            'name' => 'Principal',
            'region_id' => $region->id,
            'biome_id' => $biome->id,
        ])
        ->assertStatus(201);

    $player = Player::where('user_id', $user->id)->first();
    $city = City::where('player_id', $player->id)->first();

    // TH Nvl 1, resto Nvl 0: oro/h 24 (100 × 0,24), producción base,
    // defensa 10 y poder defensivo 10 sin tropas.
    $this->actingAs($user, 'sanctum')
        ->getJson("/api/cities/{$city->id}")
        ->assertStatus(200)
        ->assertJsonPath('city.perHour.gold', 24)
        ->assertJsonPath('city.perHour.wood', 35)
        ->assertJsonPath('city.perHour.stone', 30)
        ->assertJsonPath('city.perHour.iron', 15)
        ->assertJsonPath('city.perHour.food', 15)
        ->assertJsonPath('city.population', 100)
        ->assertJsonPath('city.defense', 10)
        ->assertJsonPath('city.stationedTroops', 0)
        ->assertJsonPath('city.defensePower', 10);
});
