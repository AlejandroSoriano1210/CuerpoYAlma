<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\HorarioClaseUser;
use Illuminate\Http\Request;

class ReservaClaseController extends Controller
{
    // Crear reserva
    public function store(Request $request)
    {
        $validated = $request->validate([
            'horario_clase_id' => 'required|exists:horario_clases,id',
        ]);

        $horarioClase = HorarioClase::findOrFail($validated['horario_clase_id']);

        // Verificar capacidad
        $inscritos = $horarioClase->clientes()->count();
        if ($inscritos >= $horarioClase->clase->capacidad) {
            return redirect()->back()->with('error', 'La clase está completa.');
        }

        // Verificar que no esté ya inscrito
        if ($horarioClase->clientes()->where('user_id', auth()->id())->exists()) {
            return redirect()->back()->with('error', 'Ya estás inscrito en esta clase.');
        }

        // Crear reserva
        HorarioClaseUser::create([
            'horario_clase_id' => $validated['horario_clase_id'],
            'user_id' => auth()->id(),
            'estado' => 'confirmado',
        ]);

        return redirect()->back()->with('success', '¡Reserva realizada correctamente!');
    }

    // Cancelar reserva
    public function cancelar(HorarioClaseUser $reserva)
    {
        if ($reserva->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'No tienes permiso.');
        }

        $reserva->update(['estado' => 'cancelado']);

        return redirect()->back()->with('success', 'Reserva cancelada correctamente.');
    }
}
