<?php

namespace App\Services;

use App\Models\GimnasioHorario;
use Carbon\Carbon;

class GimnasioHorarioService
{
    /**
     * Obtener los horarios del gimnasio
     */
    public static function obtenerHorarios()
    {
        return GimnasioHorario::all()
            ->sortBy(function ($h) {
                $diasMap = ['Lunes' => 0, 'Martes' => 1, 'Miércoles' => 2, 'Jueves' => 3, 'Viernes' => 4, 'Sábado' => 5, 'Domingo' => 6];
                return $diasMap[$h->dia_semana] ?? 7;
            })
            ->values();
    }

    /**
     * Obtener horario del gimnasio para un día específico
     */
    public static function obtenerHorarioPorDia($nombreDia)
    {
        return GimnasioHorario::where('dia_semana', $nombreDia)->first();
    }

    /**
     * Validar que una hora esté dentro del horario del gimnasio
     * @param string $fecha Fecha en formato Y-m-d
     * @param string $horaInicio Hora en formato H:i
     * @param string $horaFin Hora en formato H:i
     * @return array ['valido' => bool, 'error' => string|null]
     */
    public static function validarHorarioGimnasio($fecha, $horaInicio, $horaFin)
    {
        $fechaObj = Carbon::parse($fecha);

        // Obtener nombre del día en español
        $diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        $nombreDia = $diasSemana[$fechaObj->dayOfWeek];

        // Buscar horario del gimnasio para ese día
        $horarioGimnasio = self::obtenerHorarioPorDia($nombreDia);

        if (!$horarioGimnasio) {
            return [
                'valido' => false,
                'error' => "El gimnasio no tiene horario asignado para el {$nombreDia}."
            ];
        }

        $apertura = substr($horarioGimnasio->hora_apertura, 0, 5);
        $cierre = substr($horarioGimnasio->hora_cierre, 0, 5);

        if ($horaInicio < $apertura || $horaFin > $cierre) {
            return [
                'valido' => false,
                'error' => "El horario debe estar entre {$apertura} y {$cierre} (horario del gimnasio para {$nombreDia})."
            ];
        }

        return ['valido' => true];
    }
}
