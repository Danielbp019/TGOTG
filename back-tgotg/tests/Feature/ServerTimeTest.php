<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('la hora del servidor requiere autenticación', function () {
    $this->getJson('/api/server-time')->assertStatus(401);
});

test('un usuario autenticado obtiene la hora del servidor', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/server-time')
        ->assertStatus(200)
        ->assertJsonStructure(['time'])
        ->assertJsonPath('time', now()->toIso8601String());
});
