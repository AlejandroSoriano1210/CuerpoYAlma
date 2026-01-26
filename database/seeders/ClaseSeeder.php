<?php

namespace Database\Seeders;

use App\Models\Clase;
use App\Models\GimnasioHorario;
use App\Models\HorarioClase;
use App\Models\HorarioTrabajo;
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
            ['nombre' => 'CrossFit', 'capacidad' => 20],
            ['nombre' => 'Spinning', 'capacidad' => 20],
            ['nombre' => 'HIIT', 'capacidad' => 18],
        ];

        $hoy = now();
        $mesActual = $hoy->month;
        $anoActual = $hoy->year;
        $diaActual = $hoy->day;
        $mapaDiaSemana = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];

        // Crear clases solo para el mes actual (máx 2 por semana)
        foreach ($tiposClases as $tipo) {
            $clase = Clase::create([
                'user_id' => $entrenadores->random()->id,
                'nombre' => $tipo['nombre'],
                'capacidad' => $tipo['capacidad'],
            ]);

            $horariosAInsertar = [];

            // Generar días disponibles desde mañana hasta fin de mes para evitar bucles infinitos
            $maxHorarios = 8; // 2 por semana aprox.
            $fechasDisponibles = [];
            $fechaCursor = Carbon::createFromDate($anoActual, $mesActual, $diaActual)->addDay();
            $finDeMes = Carbon::createFromDate($anoActual, $mesActual, 1)->endOfMonth();

            while ($fechaCursor->lessThanOrEqualTo($finDeMes)) {
                $fechasDisponibles[] = $fechaCursor->copy();
                $fechaCursor->addDay();
            }

            shuffle($fechasDisponibles);
            $fechasSeleccionadas = array_slice($fechasDisponibles, 0, min($maxHorarios, count($fechasDisponibles)));

            foreach ($fechasSeleccionadas as $fecha) {
                $nombreDia = $mapaDiaSemana[$fecha->dayOfWeekIso] ?? null;
                if (!$nombreDia) {
                    continue;
                }

                $horarioGimnasio = GimnasioHorario::where('dia_semana', $nombreDia)->first();
                if (!$horarioGimnasio) {
                    continue;
                }

                $turnosEntrenador = HorarioTrabajo::where('user_id', $clase->user_id)
                    ->where('dia_semana', $nombreDia)
                    ->get();

                if ($turnosEntrenador->isEmpty()) {
                    continue;
                }

                $slotsDisponibles = [];
                $apertura = Carbon::parse($horarioGimnasio->hora_apertura);
                $cierre = Carbon::parse($horarioGimnasio->hora_cierre);

                foreach ($turnosEntrenador as $turno) {
                    $inicioTurno = Carbon::parse($turno->hora_inicio);
                    $finTurno = Carbon::parse($turno->hora_fin);

                    $inicio = $inicioTurno->greaterThan($apertura) ? $inicioTurno->copy() : $apertura->copy();
                    $fin = $finTurno->lessThan($cierre) ? $finTurno->copy() : $cierre->copy();

                    $slot = $inicio->copy();
                    while ($slot->addHour()->lessThanOrEqualTo($fin)) {
                        $slotInicio = $slot->copy()->subHour();
                        $slotsDisponibles[] = $slotInicio->format('H:i:s');
                    }
                }

                if (empty($slotsDisponibles)) {
                    continue;
                }

                $hora = $slotsDisponibles[array_rand($slotsDisponibles)];
                $horaFin = date('H:i:s', strtotime($hora) + 3600);

                $horariosAInsertar[] = [
                    'user_id' => $clase->user_id,
                    'clase_id' => $clase->id,
                    'nombre' => $tipo['nombre'],
                    'capacidad' => $tipo['capacidad'],
                    'fecha' => $fecha,
                    'hora_inicio' => $hora,
                    'hora_fin' => $horaFin,
                    'descripcion' => "Clase de {$tipo['nombre']} impartida por el entrenador",
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($horariosAInsertar)) {
                HorarioClase::insert($horariosAInsertar);
            }
        }

        $this->command->info('✅ 4 clases creadas con hasta 2 horarios por semana del mes actual, respetando turnos y horario del gimnasio.');
    }
}
