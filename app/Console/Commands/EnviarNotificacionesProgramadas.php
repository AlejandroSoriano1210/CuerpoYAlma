<?php

namespace App\Console\Commands;

use App\Models\NotificacionProgramada;
use App\Models\User;
use App\Notifications\SimpleNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class EnviarNotificacionesProgramadas extends Command
{
    protected $signature = 'notificaciones:enviar-programadas';
    protected $description = 'Procesa y envía las notificaciones programadas que están pendientes';

    public function handle(): int
    {
        $pendientes = NotificacionProgramada::pendientesDeEnvio()->get();

        if ($pendientes->isEmpty()) {
            $this->info('No hay notificaciones pendientes de envío.');
            return 0;
        }

        $enviadas = 0;

        foreach ($pendientes as $notificacion) {
            try {
                $this->enviarNotificacion($notificacion);

                $notificacion->update([
                    'ultima_ejecucion' => Carbon::now(),
                ]);

                // Para notificaciones de una sola vez, desactivar tras enviar
                if ($notificacion->tipo_envio === 'unica_vez') {
                    $notificacion->update([
                        'activa' => false,
                        'proxima_ejecucion' => null,
                    ]);
                } else {
                    // Calcular próxima ejecución para recurrentes
                    $proxima = $notificacion->calcularProximaEjecucion();
                    $notificacion->update(['proxima_ejecucion' => $proxima]);
                }

                $enviadas++;
                $this->info("✅ Enviada: {$notificacion->titulo}");
            } catch (\Exception $e) {
                $this->error("❌ Error al enviar '{$notificacion->titulo}': {$e->getMessage()}");
            }
        }

        $this->info("Proceso completado. {$enviadas} notificaciones enviadas.");

        return 0;
    }

    private function enviarNotificacion(NotificacionProgramada $notificacion): void
    {
        $notification = new SimpleNotification(
            $notificacion->mensaje,
            $notificacion->url
        );

        $usuarios = $this->obtenerDestinatarios($notificacion);
        $count = 0;

        foreach ($usuarios as $usuario) {
            $usuario->notify($notification);
            $count++;
            // Pequeña pausa para no saturar
            if ($count % 50 === 0) {
                usleep(500000); // 0.5 segundos cada 50
            }
        }

        $this->line("   → Enviada a {$count} usuario(s)");
    }

    private function obtenerDestinatarios(NotificacionProgramada $notificacion)
    {
        return match ($notificacion->destinatarios) {
            'todos' => User::all(),
            'clientes' => User::role('cliente')->get(),
            'empleados' => User::role(['entrenador', 'tecnico', 'limpieza'])->get(),
            'entrenadores' => User::role('entrenador')->get(),
            'tecnicos' => User::role('tecnico')->get(),
            'limpieza' => User::role('limpieza')->get(),
            'usuario_especifico' => $notificacion->usuario_id
                ? User::where('id', $notificacion->usuario_id)->get()
                : collect(),
            default => collect(),
        };
    }
}
