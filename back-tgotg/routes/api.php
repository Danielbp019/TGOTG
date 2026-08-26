<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CitiesController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\SystemController;
use App\Http\Controllers\Api\WorldController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
});

Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/account/profile', [AccountController::class, 'updateProfile']);
    Route::delete('/account', [AccountController::class, 'destroy']);
    Route::get('/server-time', [SystemController::class, 'serverTime']);
    Route::get('/player/blessing', [PlayerController::class, 'blessing']);
    Route::put('/player/blessing', [PlayerController::class, 'updateBlessing']);
    Route::get('/player/resources', [PlayerController::class, 'resources']);
    Route::get('/player/civilization', [PlayerController::class, 'civilization']);
    Route::put('/player/civilization', [PlayerController::class, 'updateCivilization']);
    Route::get('/blessings', [SystemController::class, 'blessings']);
    Route::get('/civilizations', [SystemController::class, 'civilizations']);
    Route::get('/building-types', [SystemController::class, 'buildingTypes']);
    Route::get('/unit-types', [SystemController::class, 'unitTypes']);
    Route::get('/game-options', [SystemController::class, 'gameOptions']);
    Route::get('/city', [CityController::class, 'show']);
    Route::get('/cities', [CitiesController::class, 'index']);
    Route::get('/cities/{city}', [CitiesController::class, 'show']);
    Route::post('/cities', [CitiesController::class, 'store']);
    Route::get('/regions', [RegionController::class, 'index']);
    Route::get('/biomes', [RegionController::class, 'biomes']);
    Route::post('/city/buildings/{building}/repair', [CityController::class, 'repair']);
    Route::post('/city/buildings/{building}/upgrade', [CityController::class, 'upgrade']);
    Route::post('/worlds', [WorldController::class, 'store']);

    Route::middleware('throttle:30,1')->group(function () {
        Route::get('/conversations', [MessageController::class, 'index']);
        Route::post('/conversations', [MessageController::class, 'store']);
        Route::get('/conversations/{conversation}', [MessageController::class, 'show']);
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'sendMessage']);
        Route::delete('/conversations/{conversation}', [MessageController::class, 'destroy']);
    });
});
