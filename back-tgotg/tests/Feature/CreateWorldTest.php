<?php

use App\Models\City;
use App\Models\GameOption;
use App\Models\Player;
use App\Models\User;
use App\Models\World;
use Database\Seeders\BuildingTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('crear un mundo requiere autenticación', function () {
    $this->postJson('/api/worlds', [
        'duration_key' => 'normal',
        'multiplier_key' => 'x1',
    ])->assertStatus(401);
});

test('solo el administrador puede iniciar una contienda', function () {
    $user = User::factory()->create(['role' => 'player']);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/worlds', [
            'duration_key' => 'normal',
            'multiplier_key' => 'x1',
        ])->assertStatus(403);
});

test('no se puede crear un mundo con opciones inexistentes', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/worlds', [
            'duration_key' => 'desconocida',
            'multiplier_key' => 'x1',
        ])->assertStatus(422);
});

test('no se puede mezclar un multiplicador como duración', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    GameOption::factory()->create([
        'type' => GameOption::TYPE_MULTIPLIER,
        'key' => 'x1',
        'value' => 1,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/worlds', [
            'duration_key' => 'x1',
            'multiplier_key' => 'x1',
        ])->assertStatus(422);
});

test('un administrador crea la contienda con duración y velocidad resueltas', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->seed(BuildingTypeSeeder::class);

    GameOption::factory()->create([
        'type' => GameOption::TYPE_DURATION,
        'key' => 'epica',
        'value' => 90,
    ]);
    GameOption::factory()->create([
        'type' => GameOption::TYPE_MULTIPLIER,
        'key' => 'x2',
        'value' => 2,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/worlds', [
            'duration_key' => 'epica',
            'multiplier_key' => 'x2',
        ])->assertStatus(201)
        ->assertJsonPath('world.durationDays', 90)
        ->assertJsonPath('world.speedMultiplier', 2)
        ->assertJsonPath('world.status', 'running');

    $world = World::where('status', 'running')->firstOrFail();
    expect($world->duration_days)->toBe(90)
        ->and($world->speed_multiplier)->toBe(2.0)
        ->and($world->ended_at)->not->toBeNull()
        ->and($world->started_at->diffInDays($world->ended_at))->toBe(90.0);

    $this->assertDatabaseHas('players', [
        'world_id' => $world->id,
        'user_id' => $admin->id,
    ]);

    // Flujo normal: el mundo se inicia sin ciudad; la primera ciudad se funda vía POST /cities tras elegir bendición
    $city = City::where('world_id', $world->id)->first();
    expect($city)->toBeNull();
});

test('iniciar una nueva contienda cierra la anterior y borra sus jugadores', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->seed(BuildingTypeSeeder::class);

    $previous = World::factory()->create(['status' => 'running']);
    $oldPlayer = Player::factory()->create([
        'world_id' => $previous->id,
        'user_id' => $admin->id,
    ]);
    City::factory()->create([
        'player_id' => $oldPlayer->id,
        'world_id' => $previous->id,
    ]);

    GameOption::factory()->create([
        'type' => GameOption::TYPE_DURATION,
        'key' => 'normal',
        'value' => 30,
    ]);
    GameOption::factory()->create([
        'type' => GameOption::TYPE_MULTIPLIER,
        'key' => 'x1',
        'value' => 1,
    ]);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/worlds', [
            'duration_key' => 'normal',
            'multiplier_key' => 'x1',
        ])->assertStatus(201);

    $previous->refresh();
    expect($previous->status)->toBe('finished')
        ->and($previous->ended_at)->not->toBeNull()
        ->and(Player::where('world_id', $previous->id)->exists())->toBeFalse()
        ->and(City::where('world_id', $previous->id)->exists())->toBeFalse();

    $world = World::where('status', 'running')->first();
    expect($world)->not->toBeNull()
        ->and($world->id)->not->toBe($previous->id);
});
