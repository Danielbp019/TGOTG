<?php

use App\Models\Blessing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('el catálogo de bendiciones requiere autenticación', function () {
    $this->getJson('/api/blessings')->assertStatus(401);
});

test('devuelve las bendiciones disponibles con su estructura', function () {
    $user = User::factory()->create();

    Blessing::factory()->create([
        'key' => 'cosecha-abundante',
        'name' => 'Cosecha abundante',
        'benefit' => '+10 % producción de comida',
        'description' => 'Tus campos rinden más.',
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/blessings')
        ->assertStatus(200)
        ->assertJsonCount(1, 'blessings')
        ->assertJsonPath('blessings.0.key', 'cosecha-abundante')
        ->assertJsonPath('blessings.0.name', 'Cosecha abundante')
        ->assertJsonPath('blessings.0.benefit', '+10 % producción de comida')
        ->assertJsonPath('blessings.0.description', 'Tus campos rinden más.');
});
