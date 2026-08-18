<?php

use App\Models\GameOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('las opciones de juego requieren autenticación', function () {
    $this->getJson('/api/game-options')->assertStatus(401);
});

test('devuelve las duraciones y multiplicadores disponibles', function () {
    $user = User::factory()->create();

    GameOption::factory()->create([
        'type' => GameOption::TYPE_DURATION,
        'key' => 'normal',
        'label' => 'Normal',
        'value' => 30,
        'description' => 'El equilibrio clásico.',
        'sort_order' => 1,
    ]);

    GameOption::factory()->create([
        'type' => GameOption::TYPE_MULTIPLIER,
        'key' => 'x2',
        'label' => '2x',
        'value' => 2,
        'description' => 'Producción acelerada.',
        'sort_order' => 1,
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/game-options')
        ->assertStatus(200)
        ->assertJsonCount(1, 'durations')
        ->assertJsonCount(1, 'multipliers')
        ->assertJsonPath('durations.0.key', 'normal')
        ->assertJsonPath('durations.0.value', 30)
        ->assertJsonPath('multipliers.0.key', 'x2')
        ->assertJsonPath('multipliers.0.value', 2);
});
