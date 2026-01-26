<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\DeleteExpiredClases;
use App\Console\Commands\SendMonthlyMeasurementReminder;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        DeleteExpiredClases::class,
        SendMonthlyMeasurementReminder::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        $schedule->command('clases:eliminar-expiradas')->dailyAt('00:05');

        // Enviar recordatorio de métricas el 1 de cada mes a las 08:00
        $schedule->command('measurements:send-reminder')->monthlyOn(1, '08:00');
    }
}
