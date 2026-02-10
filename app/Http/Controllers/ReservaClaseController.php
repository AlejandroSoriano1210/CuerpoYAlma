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

    /**
     * Procesa la promoción automática de usuarios desde la lista de espera
     */
    private function procesarPromocionesDeLista(HorarioClase $horario)
    {
        // Obtener espacios disponibles
        $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
        $espaciosDisponibles = $horario->capacidad - $inscritos;

        if ($espaciosDisponibles <= 0) {
            return;
        }

        // Obtener los primeros usuarios de la lista de espera
        $usuarios = ListaEsperaClase::where('horario_clase_id', $horario->id)
            ->orderBy('posicion', 'asc')
            ->limit($espaciosDisponibles)
            ->get();

        foreach ($usuarios as $listaEspera) {
            // NO reservar automáticamente, solo notificar
            // Notificar al usuario con opción de aceptar/rechazar
            \Illuminate\Support\Facades\Notification::send(
                \App\Models\User::find($listaEspera->user_id),
                new \App\Notifications\SimpleNotification(
                    "¡Hay un lugar disponible en la clase '{$horario->nombre}' del {$horario->fecha->format('d/m/Y')}! ¿Deseas reservar tu plaza?",
                    route('clases.show', $horario->id),
                    [
                        'tipo' => 'lista_espera_disponible',
                        'horario_clase_id' => $horario->id,
                        'lista_espera_id' => $listaEspera->id,
                    ]
                )
            );
        }

        // Reordenar posiciones en la lista de espera
        ListaEsperaClase::reordenarPosiciones($horario->id);
    }

    /**
     * Cancelar un lugar en la lista de espera
     */
    public function cancelarListaEspera(\Illuminate\Http\Request $request, ListaEsperaClase $listaEspera)
    {
        if ($listaEspera->user_id !== auth()->id()) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'No tienes permiso.');
            }

            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        $horarioId = $listaEspera->horario_clase_id;
        $listaEspera->delete();

        // Reordenar posiciones
        ListaEsperaClase::reordenarPosiciones($horarioId);

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Has sido removido de la lista de espera.');
        }

        return response()->json(['success' => true]);
    }

    /**
     * Promover manualmente un usuario de lista de espera a clase (para entrenadores)
     */
    public function promoverDelListaEspera(\Illuminate\Http\Request $request, ListaEsperaClase $listaEspera)
    {
        $horario = $listaEspera->horarioClase;

        // Verificar permisos: solo el entrenador de la clase o superusuario
        if ($horario->user_id !== auth()->id() && !auth()->user()->hasRole('superusuario')) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'No tienes permiso.');
            }

            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        // Comprobar si hay espacio
        $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
        if ($inscritos >= $horario->capacidad) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'La clase está completa.');
            }

            return response()->json(['error' => 'La clase está completa.'], 422);
        }

        // Crear la reserva
        HorarioClaseUser::create([
            'horario_clase_id' => $horario->id,
            'user_id' => $listaEspera->user_id,
            'estado' => 'pendiente',
        ]);

        // Eliminar de la lista de espera
        $listaEspera->delete();

        // Reordenar posiciones
        ListaEsperaClase::reordenarPosiciones($horario->id);

        // Notificar al usuario
        \Illuminate\Support\Facades\Notification::send(
            \App\Models\User::find($listaEspera->user_id),
            new \App\Notifications\SimpleNotification(
                "¡Felicidades! Has sido promovido de la lista de espera a la clase '{$horario->nombre}' del {$horario->fecha->format('d/m/Y')}.",
                route('clases.show', $horario->id)
            )
        );

        if ($request->header('X-Inertia')) {
            return redirect()->back()->with('success', 'Usuario promovido a la clase correctamente.');
        }

        return response()->json(['success' => true]);
    }
}
