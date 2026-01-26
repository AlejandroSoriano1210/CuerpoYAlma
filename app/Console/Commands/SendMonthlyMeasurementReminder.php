<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\SimpleNotification;
use Illuminate\Console\Command;

class SendMonthlyMeasurementReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'measurements:send-reminder';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Send monthly reminder notification to all clients to update their body measurements';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get all users with role 'cliente'
        $clientes = User::whereHas('roles', function ($query) {
            $query->where('name', 'cliente');
        })->get();

        $count = 0;

        foreach ($clientes as $cliente) {
            $cliente->notify(
                new SimpleNotification(
                    '📏 ¡Es hora de actualizar tus métricas corporales! Registra tus medidas del mes para ver tu progreso en las gráficas.',
                    '/estadisticas'
                )
            );
            $count++;
        }

        $this->info("✅ Notificación de actualización de métricas enviada a {$count} clientes.");

        return 0;
    }
}
