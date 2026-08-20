<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('un usuario puede registrarse', function () {
    $response = $this->postJson('/api/auth/register', [
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'nick', 'email', 'role'],
        ])
        ->assertJsonPath('user.nick', 'Thor')
        ->assertJsonPath('user.role', 'player');

    $this->assertDatabaseHas('users', [
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'role' => 'player',
    ]);
});

test('el registro rechaza el rol enviado por el cliente', function () {
    $this->postJson('/api/auth/register', [
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
    ])->assertStatus(201);

    expect(User::where('nick', 'Thor')->value('role'))->toBe('player');
});

test('el registro valida los datos', function () {
    $this->postJson('/api/auth/register', [
        'nick' => '',
        'email' => 'no-es-un-email',
        'password' => 'short',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['nick', 'email', 'password']);
});

test('el registro rechaza un email duplicado', function () {
    User::factory()->create(['email' => 'thor@example.com']);

    $this->postJson('/api/auth/register', [
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('el registro rechaza un nick duplicado exacto', function () {
    User::factory()->create(['nick' => 'Thor']);

    $this->postJson('/api/auth/register', [
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['nick'])
        ->assertJsonPath('errors.nick.0', 'Este nick ya está en uso.');
});

test('el registro permite nicks que solo difieren en mayúsculas', function () {
    $this->postJson('/api/auth/register', [
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(201);

    $this->postJson('/api/auth/register', [
        'nick' => 'thor',
        'email' => 'thor2@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(201);

    expect(User::where('nick', 'Thor')->exists())->toBeTrue();
    expect(User::where('nick', 'thor')->exists())->toBeTrue();
});

test('el registro está limitado a 6 peticiones por minuto', function () {
    for ($i = 0; $i < 6; $i++) {
        $this->postJson('/api/auth/register', [
            'nick' => "Thor{$i}",
            'email' => "thor{$i}@example.com",
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertStatus(201);
    }

    $this->postJson('/api/auth/register', [
        'nick' => 'Thor6',
        'email' => 'thor6@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertStatus(429);
});

test('un usuario puede iniciar sesión', function () {
    User::factory()->create([
        'nick' => 'Thor',
        'email' => 'thor@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'thor@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'token',
            'user' => ['id', 'nick', 'email', 'role'],
        ])
        ->assertJsonPath('user.nick', 'Thor');
});

test('el login rechaza credenciales inválidas', function () {
    User::factory()->create([
        'email' => 'thor@example.com',
        'password' => 'password',
    ]);

    $this->postJson('/api/auth/login', [
        'email' => 'thor@example.com',
        'password' => 'incorrecta',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('un usuario autenticado puede obtener su perfil', function () {
    $user = User::factory()->create(['nick' => 'Thor']);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/user')
        ->assertStatus(200)
        ->assertJsonPath('nick', 'Thor')
        ->assertJsonMissing(['password']);
});

test('el logout revoca el token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/auth/logout')
        ->assertStatus(200);

    $this->assertDatabaseCount('personal_access_tokens', 0);

    auth()->forgetGuards();

    $this->withToken($token)
        ->getJson('/api/user')
        ->assertStatus(401);
});

test('el perfil requiere autenticación', function () {
    $this->getJson('/api/user')->assertStatus(401);
});

test('el perfil sin token devuelve 401 JSON aunque no se pida json', function () {
    $this->get('/api/user')
        ->assertStatus(401)
        ->assertHeader('content-type', 'application/json');
});
