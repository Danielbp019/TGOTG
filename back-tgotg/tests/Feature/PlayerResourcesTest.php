<?php

use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('los recursos del jugador requieren autenticación', function () {
    $this->getJson('/api/player/resources')->assertStatus(401);
});

test('un usuario sin jugador no tiene recursos', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/resources')
        ->assertStatus(200)
        ->assertJsonPath('in_game', false)
        ->assertJsonPath('resources', null);
});

test('devuelve los recursos generales del jugador', function () {
    $user = User::factory()->create();
    $world = World::factory()->create(['status' => 'running']);
    Player::factory()->create([
        'world_id' => $world->id,
        'user_id' => $user->id,
        'gold' => 12450,
        'wood' => 8300,
        'stone' => 6200,
        'iron' => 4100,
        'food' => 9700,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/player/resources')
        ->assertStatus(200)
        ->assertJsonPath('in_game', true)
        ->assertJsonPath('resources.gold', 12450)
        ->assertJsonPath('resources.wood', 8300)
        ->assertJsonPath('resources.stone', 6200)
        ->assertJsonPath('resources.iron', 4100)
        ->assertJsonPath('resources.food', 9700);
});
