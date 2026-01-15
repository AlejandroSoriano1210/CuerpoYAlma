<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HorarioTrabajo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HorarioTrabajoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 4 entrenadores
        $entrenadores = User::factory(4)->create()->each(function ($user) {
            $user->assignRole('entrenador');
        });

        // Horarios de trabajo para cada entrenador
        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        foreach ($entrenadores as $entrenador) {
            // Cada entrenador trabaja 5-6 días
            $diasAleatorios = array_slice($diasSemana, 0, rand(5, 6));

            foreach ($diasAleatorios as $dia) {
                HorarioTrabajo::create([
                    'user_id' => $entrenador->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => '06:00:00',
                    'hora_fin' => '14:00:00',
                ]);

                // Algunos entrenadores tienen turno doble
                if (rand(1, 100) <= 30) {
                    HorarioTrabajo::create([
                        'user_id' => $entrenador->id,
                        'dia_semana' => $dia,
                        'hora_inicio' => '14:00:00',
                        'hora_fin' => '22:00:00',
                    ]);
                }
            }
        }

        $this->command->info('✅ 4 entrenadores creados con sus horarios de trabajo.');
    }
}
