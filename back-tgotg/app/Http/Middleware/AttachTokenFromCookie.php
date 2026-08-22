<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AttachTokenFromCookie
{
    /**
     * Si la petición no trae Authorization pero sí cookie tgotg_token,
     * la inyecta como Bearer para que Sanctum pueda autenticar.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->bearerToken() && $request->cookie('tgotg_token')) {
            $request->headers->set('Authorization', 'Bearer '.$request->cookie('tgotg_token'));
        }

        return $next($request);
    }
}
