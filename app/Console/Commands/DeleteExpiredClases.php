<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HorarioClase;

class DeleteExpiredClases extends Command
{
    protected $signature = 'clases:eliminar-expiradas';
    protected $description = 'Eliminar automáticamente las clases cuyo día ya pasó';

    public function handle()
    {
        $count = HorarioClase::eliminarClasesExpiradas();
        $this->info("Clases eliminadas: {$count}");
        return 0;
    }
}
