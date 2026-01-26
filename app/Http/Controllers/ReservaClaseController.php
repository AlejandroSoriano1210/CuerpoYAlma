<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\HorarioClaseUser;
use App\Models\ListaEsperaClase;
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

        // Verificar si el usuario ya está en la clase o en la lista de espera
        if ($horarioClase->clientes()->where('user_id', auth()->id())->wherePivot('estado', '!=', 'cancelado')->exists()) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Ya estás inscrito en esta clase.');
            }

            return response()->json(['error' => 'Ya estás inscrito en esta clase.'], 422);
        }

        if (ListaEsperaClase::where('horario_clase_id', $horarioClase->id)
            ->where('user_id', auth()->id())->exists()) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Ya estás en la lista de espera de esta clase.');
            }

            return response()->json(['error' => 'Ya estás en la lista de espera de esta clase.'], 422);
        }

        // Si la clase está completa, agregar a lista de espera
        if ($inscritos >= $horarioClase->capacidad) {
            ListaEsperaClase::agregarALista($horarioClase->id, auth()->id());

            $mensaje = 'La clase está completa. ¡Te hemos añadido a la lista de espera!';
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', $mensaje);
            }

            return response()->json(['success' => true, 'mensaje' => $mensaje], 201);
        }

        // Si hay espacios, crear reserva directamente
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

        // Si la clase estaba completa, promover de la lista de espera
        if ($wasFull) {
            $this->procesarPromocionesDeLista($horario);
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
            // Crear la reserva
            HorarioClaseUser::create([
                'horario_clase_id' => $horario->id,
                'user_id' => $listaEspera->user_id,
                'estado' => 'pendiente',
            ]);

            // Eliminar de la lista de espera
            $listaEspera->delete();

            // Notificar al usuario
            \Illuminate\Support\Facades\Notification::send(
                \App\Models\User::find($listaEspera->user_id),
                new \App\Notifications\SimpleNotification(
                    "¡Felicidades! Hay un lugar disponible en la clase '{$horario->nombre}' del {$horario->fecha->format('d/m/Y')}. Tu reserva ha sido confirmada.",
                    route('clases.show', $horario->id)
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
