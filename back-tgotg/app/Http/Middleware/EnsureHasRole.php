<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasRole
{
    /**
     * Verifica que el usuario autenticado tenga uno de los roles permitidos.
     *
     * Uso: middleware('role:admin') o middleware('role:admin,moderator')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null || ! in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => __('No tienes permiso para realizar esta acción.'),
            ], 403);
        }

        return $next($request);
    }
}
