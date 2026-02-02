<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\HorarioTrabajo;
use Carbon\Carbon;
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
        $entrenadores = User::factory(4)->create([
            'created_at' => Carbon::create(2025, 1, 1),
            'updated_at' => Carbon::create(2025, 1, 1),
        ])->each(function ($user) {
            $user->assignRole('entrenador');
        });

        // Horarios de trabajo para cada entrenador
        // dia_semana: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado
        $diasSemana = [0, 1, 2, 3, 4, 5];

        foreach ($entrenadores as $entrenador) {
            $totalHoras = 0;
            $diasUsados = [];

            // Asignar horarios respetando máximo 40 horas semanales
            foreach ($diasSemana as $dia) {
                if ($totalHoras >= 40) {
                    break;
                }

                // Turno mañana: 8 horas (06:00-14:00)
                HorarioTrabajo::create([
                    'user_id' => $entrenador->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => '06:00:00',
                    'hora_fin' => '14:00:00',
                ]);
                $totalHoras += 8;
                $diasUsados[] = $dia;

                // Turno tarde: solo si hay espacio para 8 horas más (max 40 total)
                if ($totalHoras < 32 && rand(1, 100) <= 50) {
                    HorarioTrabajo::create([
                        'user_id' => $entrenador->id,
                        'dia_semana' => $dia,
                        'hora_inicio' => '14:00:00',
                        'hora_fin' => '22:00:00',
                    ]);
                    $totalHoras += 8;
                }
            }
        }

        $this->command->info('✅ 4 entrenadores creados con horarios válidos (máx 40 horas/semana).');
    }
}
