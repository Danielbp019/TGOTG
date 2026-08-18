<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    public function serverTime(): JsonResponse
    {
        return response()->json([
            'time' => now()->toIso8601String(),
        ]);
    }
}
