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
        // Crear 5 entrenadores
        $entrenadores = User::factory(5)->create([
            'created_at' => Carbon::create(2025, 1, 1),
            'updated_at' => Carbon::create(2025, 1, 1),
        ])->each(function ($user) {
            $user->assignRole('entrenador');
        });

        // Crear 3 técnicos
        $tecnicos = User::factory(3)->create([
            'created_at' => Carbon::create(2025, 1, 1),
            'updated_at' => Carbon::create(2025, 1, 1),
        ])->each(function ($user) {
            $user->assignRole('tecnico');
        });

        // Crear 2 empleados de limpieza
        $limpieza = User::factory(2)->create([
            'created_at' => Carbon::create(2025, 1, 1),
            'updated_at' => Carbon::create(2025, 1, 1),
        ])->each(function ($user) {
            $user->assignRole('limpieza');
        });

        // Horarios de trabajo para cada empleado
        // dia_semana: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado
        $diasSemana = [0, 1, 2, 3, 4, 5];

        // Asignar horarios a entrenadores
        foreach ($entrenadores as $entrenador) {
            $totalHoras = 0;

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

        // Asignar horarios a técnicos (turnos variados)
        foreach ($tecnicos as $tecnico) {
            $totalHoras = 0;
            $diasAsignados = array_slice($diasSemana, 0, 5); // Lunes a Viernes

            foreach ($diasAsignados as $dia) {
                if ($totalHoras >= 40) {
                    break;
                }

                // Turnos de 8 horas variados
                $turnos = [
                    ['07:00:00', '15:00:00'],
                    ['09:00:00', '17:00:00'],
                    ['15:00:00', '22:00:00'],
                ];
                $turnoElegido = $turnos[array_rand($turnos)];

                HorarioTrabajo::create([
                    'user_id' => $tecnico->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => $turnoElegido[0],
                    'hora_fin' => $turnoElegido[1],
                ]);
                $totalHoras += 8;
            }
        }

        // Asignar horarios a personal de limpieza (turnos tempranos y nocturnos)
        foreach ($limpieza as $empleado) {
            $totalHoras = 0;
            $diasAsignados = $diasSemana; // Todos los días incluyendo sábado

            foreach ($diasAsignados as $dia) {
                if ($totalHoras >= 40) {
                    break;
                }

                // Turnos de limpieza (temprano o nocturno)
                $turnos = [
                    ['05:00:00', '13:00:00'], // Turno temprano
                    ['21:00:00', '05:00:00'], // Turno nocturno (se considera como 8 horas)
                ];
                $turnoElegido = $turnos[$dia % 2]; // Alterna entre turnos

                HorarioTrabajo::create([
                    'user_id' => $empleado->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => $turnoElegido[0],
                    'hora_fin' => $turnoElegido[1],
                ]);
                $totalHoras += 8;

                if ($totalHoras >= 40) {
                    break;
                }
            }
        }

        $this->command->info('✅ 5 entrenadores, 3 técnicos y 2 empleados de limpieza creados con horarios válidos (máx 40 horas/semana).');
    }
}
