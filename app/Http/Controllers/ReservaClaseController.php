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
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Clase no encontrada.');
            }

            return response()->json(['error' => 'Clase no encontrada.'], 404);
        }

        // Contar solo reservas no canceladas
        $inscritos = $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->count();

        if ($inscritos >= $horarioClase->capacidad) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'La clase está completa.');
            }

            return response()->json(['error' => 'La clase está completa.'], 422);
        }

        if ($horarioClase->clientes()->where('user_id', auth()->id())->wherePivot('estado', '!=', 'cancelado')->exists()) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Ya estás inscrito en esta clase.');
            }

            return response()->json(['error' => 'Ya estás inscrito en esta clase.'], 422);
        }

        HorarioClaseUser::create([
            'horario_clase_id' => $validated['horario_clase_id'],
            'user_id' => auth()->id(),
            'estado' => 'pendiente',
        ]);

        // If request comes from Inertia (browser), return a redirect with flash message
        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', '¡Reserva realizada correctamente!');
        }

        // For API/tests, return JSON
        return response()->json(['success' => true], 201);
    }

    public function cancelar(\Illuminate\Http\Request $request, HorarioClaseUser $reserva)
    {
        if ($reserva->user_id !== auth()->id()) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'No tienes permiso.');
            }

            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        $horario = $reserva->horarioClase;

        // comprobar si la clase estaba completa antes de cancelar
        // Considerar cualquier reserva no cancelada como ocupando un puesto
        $inscritosNoCancelados = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
        $wasFull = $inscritosNoCancelados >= $horario->capacidad;

        $reserva->update(['estado' => 'cancelado']);

        if ($wasFull) {
            // notificar a todos los usuarios con rol 'cliente' que NO tienen ninguna reserva no cancelada en esta clase
            $targets = \App\Models\User::role('cliente')
                ->where('id', '!=', $reserva->user_id)
                ->whereDoesntHave('clasesReservadas', function ($q) use ($horario) {
                    $q->where('horario_clases.id', $horario->id)
                      // use explicit pivot table column instead of wherePivot inside whereDoesntHave
                      ->where('horario_clase_user.estado', '!=', 'cancelado');
                })->get();

            if ($targets->count()) {
                \Illuminate\Support\Facades\Notification::send($targets, new \App\Notifications\SimpleNotification(
                    "Se ha liberado un lugar en la clase '{$horario->nombre}' el {$horario->fecha->format('d/m/Y')}.",
                    route('clases.show', $horario->id)
                ));
            }
        }

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Reserva cancelada correctamente.');
        }

        return response()->json(['success' => true]);
    }
}
