<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Limpia diariamente los tokens Sanctum expirados para no acumular basura.
Schedule::command('sanctum:prune-expired --hours=24')->daily();
