<?php

use App\Models\Civilization;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('el catálogo de civilizaciones requiere autenticación', function () {
    $this->getJson('/api/civilizations')->assertStatus(401);
    $this->putJson('/api/player/civilization', ['key' => 'humanos'])
        ->assertStatus(401);
});

test('devuelve las civilizaciones con su beneficio', function () {
    $user = User::factory()->create();

    Civilization::factory()->create([
        'key' => 'humanos',
        'name' => 'Humanos',
        'benefit' => '+5 % a todos los recursos',
        'bonus' => ['production_bonus' => ['food' => 5]],
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/civilizations')
        ->assertStatus(200)
        ->assertJsonCount(1, 'civilizations')
        ->assertJsonPath('civilizations.0.key', 'humanos')
        ->assertJsonPath('civilizations.0.name', 'Humanos')
        ->assertJsonPath('civilizations.0.benefit', '+5 % a todos los recursos');
});

test('un jugador sin civilización la obtiene como nula', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/civilization')
        ->assertStatus(200)
        ->assertJsonPath('in_game', true)
        ->assertJsonPath('civilization', null);
});

test('un jugador puede seleccionar su civilización y esta persiste', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $civilization = Civilization::factory()->create([
        'key' => 'elfos',
        'name' => 'Elfos',
        'benefit' => '+15 % comida y madera',
    ]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/player/civilization', ['key' => $civilization->key])
        ->assertStatus(200)
        ->assertJsonPath('civilization.key', 'elfos')
        ->assertJsonPath('civilization.name', 'Elfos');

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/civilization')
        ->assertStatus(200)
        ->assertJsonPath('in_game', true)
        ->assertJsonPath('civilization.key', 'elfos');

    $this->assertDatabaseHas('players', [
        'user_id' => $user->id,
        'civilization_id' => $civilization->id,
    ]);
});

test('no se puede seleccionar una civilización inexistente', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/player/civilization', ['key' => 'civilizacion-desconocida'])
        ->assertStatus(422);
});
