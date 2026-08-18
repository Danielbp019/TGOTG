<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SystemController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/server-time', [SystemController::class, 'serverTime']);
    Route::get('/player/blessing', [PlayerController::class, 'blessing']);
    Route::put('/player/blessing', [PlayerController::class, 'updateBlessing']);
});
