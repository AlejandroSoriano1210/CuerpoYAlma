<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Console\Commands\DeleteExpiredClases;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        DeleteExpiredClases::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        $schedule->command('clases:eliminar-expiradas')->dailyAt('00:05');
    }
}
