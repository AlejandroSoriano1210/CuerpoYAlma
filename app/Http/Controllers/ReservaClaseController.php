<?php

namespace App\Http\Controllers;

use App\Models\HorarioClaseUser;
use Illuminate\Http\Request;

class ReservaClaseController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'horario_clase_id' => ['required', 'exists:horario_clases,id'],
        ]);

        $reserva = HorarioClaseUser::create([
            'horario_clase_id' => $data['horario_clase_id'],
            'user_id'          => $request->user()->id,
            'estado'           => 'pendiente',
        ]);

        return response()->json($reserva, 201);
    }

    public function cancelar(Request $request, HorarioClaseUser $reserva)
    {
        // Opcional: validar que la reserva pertenece al usuario autenticado
        if ($reserva->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $reserva->update(['estado' => 'cancelado']);

        return response()->json($reserva);
    }
}
