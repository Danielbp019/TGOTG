<?php

use App\Models\BuildingType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('el catálogo de tipos de edificio requiere autenticación', function () {
    $this->getJson('/api/building-types')->assertStatus(401);
});

test('devuelve los tipos de edificio con descripción, nivel máximo y costos', function () {
    $user = User::factory()->create();

    BuildingType::factory()->create([
        'key' => 'ayuntamiento',
        'name' => 'Ayuntamiento',
        'category' => 'Principal',
        'description' => 'El corazón de la ciudad.',
        'max_level' => 5,
        'gold_cost' => 4000,
        'wood_cost' => 800,
        'stone_cost' => 600,
        'iron_cost' => 200,
        'base_minutes' => 120,
        'repair_material' => 'stone',
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/building-types')
        ->assertStatus(200)
        ->assertJsonCount(1, 'building_types')
        ->assertJsonPath('building_types.0.key', 'ayuntamiento')
        ->assertJsonPath('building_types.0.name', 'Ayuntamiento')
        ->assertJsonPath('building_types.0.category', 'Principal')
        ->assertJsonPath('building_types.0.description', 'El corazón de la ciudad.')
        ->assertJsonPath('building_types.0.max_level', 5)
        ->assertJsonPath('building_types.0.gold_cost', 4000)
        ->assertJsonPath('building_types.0.wood_cost', 800)
        ->assertJsonPath('building_types.0.stone_cost', 600)
        ->assertJsonPath('building_types.0.iron_cost', 200)
        ->assertJsonPath('building_types.0.base_minutes', 120)
        ->assertJsonPath('building_types.0.repair_material', 'stone')
        ->assertJsonCount(5, 'building_types.0.levels')
        ->assertJsonPath('building_types.0.levels.0.gold', 4000)
        ->assertJsonPath('building_types.0.levels.0.minutes', 120)
        // Nivel 2: materiales ×1.6 y tiempo ×1.5.
        ->assertJsonPath('building_types.0.levels.1.gold', 6400)
        ->assertJsonPath('building_types.0.levels.1.wood', 1280)
        ->assertJsonPath('building_types.0.levels.1.stone', 960)
        ->assertJsonPath('building_types.0.levels.1.iron', 320)
        ->assertJsonPath('building_types.0.levels.1.minutes', 180);
});
