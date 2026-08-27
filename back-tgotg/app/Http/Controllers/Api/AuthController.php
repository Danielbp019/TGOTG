<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\HasUserPayload;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use HasUserPayload;

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $remember = (bool) ($data['remember'] ?? false);

        $user = User::create($data);
        $user->refresh();

        $token = $user->createToken('auth-token')->plainTextToken;
        $minutes = $remember ? 60 * 24 * 30 : 60 * 24;

        return response()
            ->json([
                'token' => $token,
                'user' => $this->userPayload($user),
            ], 201)
            ->withCookie(cookie(
                'tgotg_token',
                $token,
                $minutes,
                '/',
                null,
                (bool) config('session.secure'),
                true,
                false,
                config('session.same_site')
            ));
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $remember = (bool) ($validated['remember'] ?? false);
        $credentials = Arr::only($validated, ['email', 'password']);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => [__('Las credenciales no coinciden con nuestros registros.')],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;
        $minutes = $remember ? 60 * 24 * 30 : 60 * 24;

        return response()
            ->json([
                'token' => $token,
                'user' => $this->userPayload($user),
            ])
            ->withCookie(cookie(
                'tgotg_token',
                $token,
                $minutes,
                '/',
                null,
                (bool) config('session.secure'),
                true,
                false,
                config('session.same_site')
            ));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()
            ->json(['message' => __('Sesión cerrada correctamente.')])
            ->withoutCookie('tgotg_token');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->userPayload($request->user()));
    }
}
