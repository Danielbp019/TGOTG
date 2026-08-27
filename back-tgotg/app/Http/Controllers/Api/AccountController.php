<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\HasUserPayload;
use App\Http\Controllers\Controller;
use App\Http\Requests\DestroyAccountRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    use HasUserPayload;

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['password']) && ! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [__('La contraseña actual no es correcta.')],
            ]);
        }

        $updates = [];

        if (isset($data['nick'])) {
            $updates['nick'] = $data['nick'];
        }

        if (isset($data['password'])) {
            $updates['password'] = $data['password'];
        }

        if ($updates !== []) {
            $user->update($updates);
        }

        return response()->json([
            'user' => $this->userPayload($user->refresh()),
        ]);
    }

    public function destroy(DestroyAccountRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if ($data['confirm_nick'] !== $user->nick) {
            throw ValidationException::withMessages([
                'confirm_nick' => [__('El nick no coincide. Escríbelo tal y como aparece.')],
            ]);
        }

        if (! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => [__('La contraseña no es correcta.')],
            ]);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => __('Cuenta eliminada correctamente.')]);
    }
}
