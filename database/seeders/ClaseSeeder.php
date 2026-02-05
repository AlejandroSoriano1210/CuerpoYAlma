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
            ['nombre' => 'Yoga', 'capacidad' => 15, 'tipo_clase' => 'Cuerpo y Mente'],
            ['nombre' => 'CrossFit', 'capacidad' => 20, 'tipo_clase' => 'Fuerza'],
            ['nombre' => 'Spinning', 'capacidad' => 20, 'tipo_clase' => 'Cardio'],
            ['nombre' => 'HIIT', 'capacidad' => 18, 'tipo_clase' => 'Cardio'],
            ['nombre' => 'Pilates', 'capacidad' => 14, 'tipo_clase' => 'Cuerpo y Mente'],
            ['nombre' => 'Boxeo', 'capacidad' => 16, 'tipo_clase' => 'Combate'],
            ['nombre' => 'Zumba', 'capacidad' => 22, 'tipo_clase' => 'Baile'],
        ];

        $hoy = now();
        $mesActual = $hoy->month;
        $anoActual = $hoy->year;
        $diaActual = $hoy->day;

        // Mapeos de días
        // ISO: 1=Lunes, 2=Martes, ... 7=Domingo
        // HorarioTrabajo: 0=Lunes, 1=Martes, ... 5=Sábado
        $mapaDiaSemana = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];
        $mapaIsoANumero = [1 => 0, 2 => 1, 3 => 2, 4 => 3, 5 => 4, 6 => 5, 7 => 6];

        // Crear clases para el mes actual y el siguiente (máx 2 por semana)
        foreach ($tiposClases as $tipo) {
            $clase = Clase::create([
                'user_id' => $entrenadores->random()->id,
                'nombre' => $tipo['nombre'],
                'capacidad' => $tipo['capacidad'],
                'tipo_clase' => $tipo['tipo_clase'],
            ]);

            $horariosAInsertar = [];

            // Generar días disponibles desde mañana hasta fin del mes siguiente para evitar bucles infinitos
            $maxHorarios = 16; // 2 por semana aprox. para 2 meses
            $fechasDisponibles = [];
            $fechaCursor = Carbon::createFromDate($anoActual, $mesActual, $diaActual)->addDay();
            $finDeMes = Carbon::createFromDate($anoActual, $mesActual, 1)->addMonth()->endOfMonth();

            while ($fechaCursor->lessThanOrEqualTo($finDeMes)) {
                $fechasDisponibles[] = $fechaCursor->copy();
                $fechaCursor->addDay();
            }

            shuffle($fechasDisponibles);
            $fechasSeleccionadas = array_slice($fechasDisponibles, 0, min($maxHorarios, count($fechasDisponibles)));

            foreach ($fechasSeleccionadas as $fecha) {
                $diaIso = $fecha->dayOfWeekIso;
                $nombreDia = $mapaDiaSemana[$diaIso] ?? null;
                $diaNumero = $mapaIsoANumero[$diaIso] ?? null;

                if (!$nombreDia || $diaNumero === null) {
                    continue;
                }

                $horarioGimnasio = GimnasioHorario::where('dia_semana', $nombreDia)->first();
                if (!$horarioGimnasio) {
                    continue;
                }

                $turnosEntrenador = HorarioTrabajo::where('user_id', $clase->user_id)
                    ->where('dia_semana', $diaNumero)
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

        $this->command->info('✅ Clases y horarios creados correctamente.');
    }
}
