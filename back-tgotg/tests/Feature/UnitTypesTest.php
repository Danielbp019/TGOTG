<?php

use App\Models\Civilization;
use App\Models\Player;
use App\Models\UnitType;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function seedCivilizations(): array
{
    $humanos = Civilization::factory()->create(['key' => 'humanos', 'name' => 'Humanos']);
    $elfos = Civilization::factory()->create(['key' => 'elfos', 'name' => 'Elfos']);

    return [$humanos, $elfos];
}

test('el catalogo de tipos de unidad requiere autenticacion', function () {
    $this->getJson('/api/unit-types')->assertStatus(401);
});

test('devuelve todas las unidades con su civilizacion cuando no hay filtro', function () {
    $user = User::factory()->create();
    [$humanos, $elfos] = seedCivilizations();

    UnitType::factory()->create([
        'civilization_id' => $humanos->id,
        'key' => 'miliciano',
        'name' => 'Miliciano',
        'tier' => 1,
    ]);
    UnitType::factory()->create([
        'civilization_id' => null,
        'key' => 'mercenario',
        'name' => 'Mercenario neutral',
        'tier' => 2,
    ]);
    UnitType::factory()->create([
        'civilization_id' => $elfos->id,
        'key' => 'arquero-elfo',
        'name' => 'Arquero élfico',
        'tier' => 1,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/unit-types')
        ->assertStatus(200)
        ->assertJsonCount(3, 'unit_types')
        ->assertJsonPath('unit_types.0.key', 'arquero-elfo')
        ->assertJsonPath('unit_types.0.civilization.key', 'elfos')
        ->assertJsonPath('unit_types.1.key', 'miliciano')
        ->assertJsonPath('unit_types.1.civilization.key', 'humanos')
        ->assertJsonPath('unit_types.2.key', 'mercenario')
        ->assertJsonPath('unit_types.2.civilization', null);
});

test('filtra por civilizacion con el parametro civilization', function () {
    $user = User::factory()->create();
    [$humanos, $elfos] = seedCivilizations();

    UnitType::factory()->create(['civilization_id' => $humanos->id, 'key' => 'miliciano', 'tier' => 1]);
    UnitType::factory()->create(['civilization_id' => $elfos->id, 'key' => 'arquero-elfo', 'tier' => 1]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/unit-types?civilization=elfos')
        ->assertStatus(200)
        ->assertJsonCount(1, 'unit_types')
        ->assertJsonPath('unit_types.0.key', 'arquero-elfo');
});

test('un jugador con civilizacion activa solo ve sus unidades y las neutrales', function () {
    $user = User::factory()->create();
    [$humanos, $elfos] = seedCivilizations();

    World::factory()->create(['status' => 'running']);
    Player::factory()->create([
        'world_id' => World::where('status', 'running')->first()->id,
        'user_id' => $user->id,
        'civilization_id' => $humanos->id,
    ]);

    UnitType::factory()->create(['civilization_id' => $humanos->id, 'key' => 'miliciano', 'tier' => 1]);
    UnitType::factory()->create(['civilization_id' => $elfos->id, 'key' => 'arquero-elfo', 'tier' => 1]);
    UnitType::factory()->create(['civilization_id' => null, 'key' => 'mercenario', 'tier' => 3]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/unit-types')
        ->assertStatus(200)
        ->assertJsonCount(2, 'unit_types')
        ->assertJsonPath('unit_types.0.key', 'miliciano')
        ->assertJsonPath('unit_types.1.key', 'mercenario');
});

test('rechaza una civilizacion inexistente en el filtro', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/unit-types?civilization=noexiste')
        ->assertStatus(422);
});
