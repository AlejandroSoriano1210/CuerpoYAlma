<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Console\Scheduling\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

app()->afterResolving(Schedule::class, function (Schedule $schedule) {
    // Eliminar clases de años anteriores el 1 de enero a las 00:00
    $schedule->command('app:eliminar-clases-anos-anteriores')->yearlyOn(1, 15, '00:00');

    // Reiniciar progreso y reasignar guias semanales cada lunes a las 00:00
    $schedule->command('guias:reset-semanal')->weeklyOn(1, '00:00');

    // Enviar notificaciones programadas cada minuto
    $schedule->command('notificaciones:enviar-programadas')->everyMinute();
});
