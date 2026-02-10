<?php

namespace App\Console\Commands;

use App\Models\GuiaAsignacion;
use App\Models\GuiaProgreso;
use App\Models\GuiaView;
use Illuminate\Console\Command;

class ResetGuiaSemanal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'guias:reset-semanal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reinicia el progreso y reasigna guias con asignacion semanal al inicio de semana';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $asignaciones = GuiaAsignacion::where('frecuencia', 'semanal')->get();

        $total = 0;
        $reassigned = 0;
        $progressDeleted = 0;

        foreach ($asignaciones as $asignacion) {
            $deleted = GuiaProgreso::where('user_id', $asignacion->user_id)
                ->where('guia_id', $asignacion->guia_id)
                ->delete();

            $progressDeleted += $deleted;

            $view = GuiaView::firstOrCreate([
                'user_id' => $asignacion->user_id,
                'guia_id' => $asignacion->guia_id,
            ]);

            if ($view->wasRecentlyCreated) {
                $reassigned++;
            }

            $total++;
        }

        $this->info("Guias semanales procesadas: {$total}. Progresos reiniciados: {$progressDeleted}. Reasignadas: {$reassigned}.");

        return Command::SUCCESS;
    }
}
