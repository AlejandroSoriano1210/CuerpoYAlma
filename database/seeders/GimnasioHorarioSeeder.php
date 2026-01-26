<?php

namespace Database\Seeders;

use App\Models\GimnasioHorario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GimnasioHorarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        foreach ($dias as $dia) {
            GimnasioHorario::create([
                'dia_semana' => $dia,
                'hora_apertura' => '06:00:00',
                'hora_cierre' => '22:00:00',
            ]);
        }

        $this->command->info('✅ Horarios del gimnasio creados para toda la semana.');
    }
}
