<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class PruneExpiredTokens
{
    private const CACHE_KEY = 'tgotg:tokens-pruned-at';

    private const PRUNE_INTERVAL_SECONDS = 86400;

    /**
     * Limpia los tokens Sanctum expirados sin depender de cron:
     * se ejecuta con la primera petición del día y se guarda la marca
     * en cache para no repetirlo en cada request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $lastPruned = (int) Cache::get(self::CACHE_KEY, 0);

        if (now()->timestamp - $lastPruned < self::PRUNE_INTERVAL_SECONDS) {
            return $next($request);
        }

        $lock = Cache::lock('tgotg:tokens-prune-lock', 60);

        if (! $lock->get()) {
            return $next($request);
        }

        try {
            DB::table('personal_access_tokens')
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', now()->subHours(24))
                ->delete();

            Cache::put(self::CACHE_KEY, now()->timestamp, now()->addDay());
        } catch (\Throwable $e) {
            // Nunca romper la petición si la limpieza falla.
            report($e);
        } finally {
            $lock->release();
        }

        return $next($request);
    }
}
