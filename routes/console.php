<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

app()->afterResolving(Schedule::class, function (Schedule $schedule) {
    // Ejecutar cada minuto para eliminar clases expiradas casi en tiempo real
    $schedule->command('clases:eliminar-expiradas')->everyMinute();

    // Enviar recordatorio de métricas el 1 de cada mes a las 08:00
    $schedule->command('measurements:send-reminder')->monthlyOn(1, '08:00');
});
