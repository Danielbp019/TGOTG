<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'nick' => [
                'sometimes',
                'string',
                'min:3',
                'max:24',
                Rule::unique('users', 'nick')->ignore($user->id),
            ],
            'current_password' => ['required_with:password', 'string'],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
        ], [
            'nick.unique' => __('Este nick ya está en uso.'),
        ]);

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

    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'confirm_nick' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

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

    /**
     * @return array{id: string, nick: string, email: string, role: string}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'nick' => $user->nick,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}
