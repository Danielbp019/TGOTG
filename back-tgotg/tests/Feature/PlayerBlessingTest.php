<?php

use App\Models\Blessing;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('la bendición del jugador requiere autenticación', function () {
    $this->getJson('/api/player/blessing')->assertStatus(401);
    $this->putJson('/api/player/blessing', ['key' => 'cosecha-abundante'])
        ->assertStatus(401);
});

test('un usuario sin jugador en la contienda no está en el juego', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/blessing')
        ->assertStatus(200)
        ->assertJsonPath('in_game', false)
        ->assertJsonPath('blessing', null);
});

test('un jugador sin bendición la obtiene como nula', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/blessing')
        ->assertStatus(200)
        ->assertJsonPath('in_game', true)
        ->assertJsonPath('blessing', null);
});

test('un jugador puede seleccionar su bendición y esta persiste', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);
    $blessing = Blessing::factory()->create([
        'key' => 'cosecha-abundante',
        'name' => 'Cosecha abundante',
    ]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/player/blessing', ['key' => $blessing->key])
        ->assertStatus(200)
        ->assertJsonPath('blessing.key', 'cosecha-abundante')
        ->assertJsonPath('blessing.name', 'Cosecha abundante');

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/blessing')
        ->assertStatus(200)
        ->assertJsonPath('in_game', true)
        ->assertJsonPath('blessing.key', 'cosecha-abundante');

    $this->assertDatabaseHas('players', [
        'user_id' => $user->id,
        'blessing_id' => $blessing->id,
    ]);
});

test('no se puede seleccionar una bendición inexistente', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create(['world_id' => $world->id, 'user_id' => $user->id]);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/player/blessing', ['key' => 'bendicion-desconocida'])
        ->assertStatus(422);
});

test('un usuario sin jugador puede seleccionar bendición y se crea su civilización con recursos iniciales', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    $blessing = Blessing::factory()->create(['key' => 'cosecha-abundante']);

    $this->actingAs($user, 'sanctum')
        ->putJson('/api/player/blessing', ['key' => $blessing->key])
        ->assertStatus(200)
        ->assertJsonPath('blessing.key', 'cosecha-abundante');

    $this->assertDatabaseHas('players', [
        'world_id' => $world->id,
        'user_id' => $user->id,
        'blessing_id' => $blessing->id,
    ]);

    $player = Player::where('world_id', $world->id)->where('user_id', $user->id)->first();
    expect($player->gold)->toBe(12450);
});
