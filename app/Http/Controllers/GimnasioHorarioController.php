<?php

namespace App\Http\Controllers;

use App\Models\GimnasioHorario;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GimnasioHorarioController extends Controller
{
    /**
     * Show the form for editing the gym hours.
     */
    public function edit()
    {
        // Obtener horarios agrupados por día
        $horarios = GimnasioHorario::all();

        // Si no existen horarios, crear los por defecto
        if ($horarios->isEmpty()) {
            $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            foreach ($diasSemana as $dia) {
                GimnasioHorario::create([
                    'dia_semana' => $dia,
                    'hora_apertura' => '06:00:00',
                    'hora_cierre' => '22:00:00',
                ]);
            }
            $horarios = GimnasioHorario::all();
        }

        return Inertia::render('GimnasioHorario/Edit', [
            'horarios' => $horarios,
        ]);
    }

    /**
     * Update the gym hours.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'horarios' => 'required|array',
            'horarios.*' => 'required|array',
            'horarios.*.hora_apertura' => 'required|date_format:H:i',
            'horarios.*.hora_cierre' => 'required|date_format:H:i|after:horarios.*.hora_apertura',
        ]);

        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        foreach ($diasSemana as $dia) {
            if (isset($validated['horarios'][$dia])) {
                $horario = GimnasioHorario::where('dia_semana', $dia)->first();

                if ($horario) {
                    $horario->update([
                        'hora_apertura' => $validated['horarios'][$dia]['hora_apertura'] . ':00',
                        'hora_cierre' => $validated['horarios'][$dia]['hora_cierre'] . ':00',
                    ]);
                } else {
                    GimnasioHorario::create([
                        'dia_semana' => $dia,
                        'hora_apertura' => $validated['horarios'][$dia]['hora_apertura'] . ':00',
                        'hora_cierre' => $validated['horarios'][$dia]['hora_cierre'] . ':00',
                    ]);
                }
            }
        }

        return redirect()->route('entrenadores.index')
            ->with('success', 'Horarios del gimnasio actualizados correctamente');
    }
}
