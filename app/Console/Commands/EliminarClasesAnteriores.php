<?php

namespace App\Console\Commands;

use App\Models\HorarioClase;
use Illuminate\Console\Command;

class EliminarClasesAnteriores extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:eliminar-clases-anos-anteriores';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Elimina todas las clases de años anteriores al actual';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $anoActual = now()->year;
        $clasesEliminadas = HorarioClase::whereYear('fecha', '<', $anoActual)->delete();

        if ($clasesEliminadas > 0) {
            $this->info("✓ Se eliminaron {$clasesEliminadas} clases de años anteriores a {$anoActual}");
        } else {
            $this->info("No hay clases de años anteriores para eliminar");
        }

        return Command::SUCCESS;
    }
}
