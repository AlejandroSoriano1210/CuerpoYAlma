<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Pago;
use Carbon\Carbon;

class GenerarPagosPrueba extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pagos:generar-prueba {--meses=3 : Número de meses anteriores a generar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera pagos de prueba para los últimos N meses para todos los clientes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mesesAtras = (int) $this->option('meses');

        $clientes = User::role('cliente')->get();

        if ($clientes->isEmpty()) {
            $this->error('No hay clientes registrados en el sistema.');
            return 1;
        }

        $this->info("Generando pagos de prueba para {$clientes->count()} clientes...");

        $pagosCreados = 0;

        foreach ($clientes as $cliente) {
            for ($i = $mesesAtras; $i >= 1; $i--) {
                $fecha = Carbon::now()->subMonths($i);
                $mes = $fecha->month;
                $ano = $fecha->year;

                // Crear pago si no existe
                $pago = Pago::updateOrCreate(
                    [
                        'user_id' => $cliente->id,
                        'mes' => $mes,
                        'ano' => $ano,
                    ],
                    [
                        'monto' => 10.00,
                        'notas' => "Pago de prueba generado automáticamente",
                    ]
                );

                if ($pago->wasRecentlyCreated) {
                    $pagosCreados++;
                }
            }

            // Actualizar último pago del cliente
            $ultimoPago = $cliente->pagos()->latest('ano')->latest('mes')->first();
            if ($ultimoPago) {
                $cliente->update([
                    'ultimo_pago_mes' => $ultimoPago->mes,
                    'ultimo_pago_ano' => $ultimoPago->ano,
                ]);
            }
        }

        $this->info("✓ Se crearon {$pagosCreados} pagos de prueba.");
        $this->info("✓ Actualizado estado de {$clientes->count()} clientes.");

        $this->newLine();
        $this->info('Ahora puedes:');
        $this->line('  1. Ir a la vista de detalle de un cliente');
        $this->line('  2. Ver el selector de facturas en la parte superior');
        $this->line('  3. Cambiar entre diferentes meses');
        $this->line('  4. Descargar PDFs de facturas');

        return 0;
    }
}
