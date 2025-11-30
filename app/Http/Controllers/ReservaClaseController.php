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
            'horario_clase_id' => 'required|integer|exists:horario_clases,id',
        ]);


        $horarioClase = HorarioClase::find($validated['horario_clase_id']);

        if (!$horarioClase) {
            return redirect()->back()->with('error', 'Clase no encontrada.');
        }

        $inscritos = $horarioClase->clientes()->count();

        if ($inscritos >= $horarioClase->capacidad) {
            return redirect()->back()->with('error', 'La clase está completa.');
        }

        if ($horarioClase->clientes()->where('user_id', auth()->id())->exists()) {
            return redirect()->back()->with('error', 'Ya estás inscrito en esta clase.');
        }

        HorarioClaseUser::create([
            'horario_clase_id' => $validated['horario_clase_id'],
            'user_id' => auth()->id(),
            'estado' => 'confirmado',
        ]);

        return redirect()->back()->with('success', '¡Reserva realizada correctamente!');
    }

    public function cancelar(HorarioClaseUser $reserva)
    {
        if ($reserva->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'No tienes permiso.');
        }

        $reserva->update(['estado' => 'cancelado']);

        return redirect()->back()->with('success', 'Reserva cancelada correctamente.');
    }
}
