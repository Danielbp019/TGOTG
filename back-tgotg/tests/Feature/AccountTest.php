<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('un usuario puede actualizar su nick', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->putJson('/api/account/profile', ['nick' => 'Odin'])
        ->assertStatus(200)
        ->assertJsonPath('user.nick', 'Odin');

    expect($user->refresh()->nick)->toBe('Odin');
});

test('actualizar el nick rechaza un nick ya en uso', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    User::factory()->create(['nick' => 'Odin']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->putJson('/api/account/profile', ['nick' => 'Odin'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['nick'])
        ->assertJsonPath('errors.nick.0', 'Este nick ya está en uso.');
});

test('actualizar el perfil permite conservar el mismo nick', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->putJson('/api/account/profile', ['nick' => 'Thor'])
        ->assertStatus(200)
        ->assertJsonPath('user.nick', 'Thor');
});

test('cambiar la contraseña requiere la contraseña actual', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->putJson('/api/account/profile', [
            'password' => 'nueva-clave',
            'password_confirmation' => 'nueva-clave',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['current_password']);
});

test('cambiar la contraseña rechaza una contraseña actual incorrecta', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->putJson('/api/account/profile', [
            'current_password' => 'incorrecta',
            'password' => 'nueva-clave',
            'password_confirmation' => 'nueva-clave',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['current_password']);
});

test('un usuario puede cambiar su contraseña', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->putJson('/api/account/profile', [
            'current_password' => 'password',
            'password' => 'nueva-clave',
            'password_confirmation' => 'nueva-clave',
        ])
        ->assertStatus(200)
        ->assertJsonPath('user.nick', 'Thor');

    // El middleware auth:sanctum deja 'sanctum' como guard por defecto en tests.
    auth()->shouldUse('web');

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'nueva-clave',
    ])->assertStatus(200);
});

test('borrar la cuenta rechaza un nick de confirmación distinto', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->deleteJson('/api/account', [
            'confirm_nick' => 'Otro',
            'password' => 'password',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['confirm_nick']);

    expect(User::find($user->id))->not->toBeNull();
});

test('borrar la cuenta rechaza una contraseña incorrecta', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->deleteJson('/api/account', [
            'confirm_nick' => 'Thor',
            'password' => 'incorrecta',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['password']);

    expect(User::find($user->id))->not->toBeNull();
});

test('borrar la cuenta elimina el usuario y sus tokens', function () {
    $user = User::factory()->create(['nick' => 'Thor']);
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->deleteJson('/api/account', [
            'confirm_nick' => 'Thor',
            'password' => 'password',
        ])
        ->assertStatus(200)
        ->assertJsonPath('message', 'Cuenta eliminada correctamente.');

    expect(User::find($user->id))->toBeNull();
    $this->assertDatabaseCount('personal_access_tokens', 0);
});
