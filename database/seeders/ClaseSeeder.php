<?php

namespace Database\Seeders;

use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ClaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener entrenadores
        $entrenadores = User::role('entrenador')->get();

        if ($entrenadores->isEmpty()) {
            $this->command->warn('⚠️ No hay entrenadores. Ejecuta HorarioTrabajoSeeder primero.');
            return;
        }

        $tiposClases = [
            ['nombre' => 'Yoga', 'capacidad' => 15],
            ['nombre' => 'Pilates', 'capacidad' => 12],
            ['nombre' => 'CrossFit', 'capacidad' => 20],
            ['nombre' => 'Boxeo', 'capacidad' => 10],
            ['nombre' => 'Zumba', 'capacidad' => 25],
            ['nombre' => 'Spinning', 'capacidad' => 20],
            ['nombre' => 'Entrenamiento Funcional', 'capacidad' => 15],
            ['nombre' => 'HIIT', 'capacidad' => 18],
        ];

        $horas = ['06:00:00', '07:00:00', '08:00:00', '09:00:00', '10:00:00',
                  '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00'];

        $mes = now()->month;
        $ano = now()->year;

        // Crear clases para el mes actual
        foreach ($tiposClases as $tipo) {
            $clase = Clase::create([
                'user_id' => $entrenadores->random()->id,
                'nombre' => $tipo['nombre'],
                'capacidad' => $tipo['capacidad'],
            ]);

            // Crear 4-5 horarios para cada clase durante el mes
            $numeroHorarios = rand(4, 5);
            $diasYaUsados = [];

            for ($i = 0; $i < $numeroHorarios; $i++) {
                do {
                    $dia = rand(1, 28);
                } while (in_array($dia, $diasYaUsados));

                $diasYaUsados[] = $dia;

                $fecha = Carbon::createFromDate($ano, $mes, $dia);
                $hora = $horas[array_rand($horas)];
                $horaFin = date('H:i:s', strtotime($hora) + 3600); // 1 hora después

                HorarioClase::create([
                    'user_id' => $clase->user_id,
                    'clase_id' => $clase->id,
                    'nombre' => $tipo['nombre'],
                    'capacidad' => $tipo['capacidad'],
                    'fecha' => $fecha,
                    'hora_inicio' => $hora,
                    'hora_fin' => $horaFin,
                    'descripcion' => "Clase de {$tipo['nombre']} impartida por el entrenador",
                ]);
            }
        }

        $this->command->info('✅ 8 clases creadas con múltiples horarios para el mes.');
    }
}
