<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('el middleware limpia los tokens expirados al recibir una petición', function () {
    $user = User::factory()->create(['nick' => 'Thor']);

    $expired = $user->createToken('expirado');
    DB::table('personal_access_tokens')
        ->where('id', $expired->accessToken->id)
        ->update(['expires_at' => now()->subDays(2)]);

    $valid = $user->createToken('válido');

    $this->getJson('/api/user')->assertStatus(401);

    $this->assertDatabaseMissing('personal_access_tokens', [
        'id' => $expired->accessToken->id,
    ]);
    $this->assertDatabaseHas('personal_access_tokens', [
        'id' => $valid->accessToken->id,
    ]);
});

test('el middleware no repite la limpieza en la misma petición', function () {
    $user = User::factory()->create(['nick' => 'Thor']);

    $expired = $user->createToken('expirado');
    DB::table('personal_access_tokens')
        ->where('id', $expired->accessToken->id)
        ->update(['expires_at' => now()->subDays(2)]);

    $this->getJson('/api/user')->assertStatus(401);

    $expiredAgain = $user->createToken('expirado-otra-vez');
    DB::table('personal_access_tokens')
        ->where('id', $expiredAgain->accessToken->id)
        ->update(['expires_at' => now()->subDays(2)]);

    $this->getJson('/api/user')->assertStatus(401);

    $this->assertDatabaseHas('personal_access_tokens', [
        'id' => $expiredAgain->accessToken->id,
    ]);
});
