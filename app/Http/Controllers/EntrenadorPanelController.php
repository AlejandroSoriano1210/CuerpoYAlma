<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\ListaEsperaClase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EntrenadorPanelController extends Controller
{
    /**
     * Mostrar todas las clases del entrenador actual
     */
    public function index()
    {
        $mes = (int) request('mes', now()->month);
        $ano = (int) request('ano', now()->year);

        if ($mes < 1 || $mes > 12) {
            $mes = now()->month;
        }
        if ($ano < 2000 || $ano > 2100) {
            $ano = now()->year;
        }

        // Obtener todas las clases del entrenador autenticado
        $clases = HorarioClase::where('user_id', auth()->id())
            ->with(['clase', 'clientes', 'listaEspera'])
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $ano)
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get()
            ->map(function ($horario) {
                $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();

                return [
                    'id' => $horario->id,
                    'nombre' => $horario->clase ? $horario->clase->nombre : $horario->nombre,
                    'fecha' => $horario->fecha->format('Y-m-d'),
                    'hora_inicio' => substr($horario->hora_inicio, 0, 5),
                    'hora_fin' => substr($horario->hora_fin, 0, 5),
                    'capacidad' => $horario->capacidad,
                    'inscritos' => $inscritos,
                    'completa' => $inscritos >= $horario->capacidad,
                    'lista_espera_count' => $horario->listaEspera->count(),
                    'descripcion' => $horario->descripcion,
                ];
            });

        return Inertia::render('Entrenador/Index', [
            'clases' => $clases,
            'mes' => $mes,
            'ano' => $ano,
            'mesNombre' => $this->getNombreMes($mes),
        ]);
    }

    /**
     * Mostrar detalles de una clase específica con su lista de espera
     */
    public function show(HorarioClase $horarioClase)
    {
        // Verificar que la clase pertenece al entrenador autenticado
        if ($horarioClase->user_id !== auth()->id()) {
            abort(403, 'No tienes permiso para ver esta clase.');
        }

        $horarioClase->load(['clase', 'clientes', 'listaEspera']);

        $inscritos = $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->get();
        $listaEspera = $horarioClase->listaEspera()
            ->with('user')
            ->orderBy('posicion')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'posicion' => $item->posicion,
                    'usuario_id' => $item->user_id,
                    'usuario_nombre' => $item->user->name,
                    'usuario_email' => $item->user->email,
                ];
            });

        return Inertia::render('Entrenador/Show', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre' => $horarioClase->clase ? $horarioClase->clase->nombre : $horarioClase->nombre,
                'fecha' => $horarioClase->fecha->format('Y-m-d'),
                'hora_inicio' => substr($horarioClase->hora_inicio, 0, 5),
                'hora_fin' => substr($horarioClase->hora_fin, 0, 5),
                'capacidad' => $horarioClase->capacidad,
                'descripcion' => $horarioClase->descripcion,
            ],
            'inscritos' => $inscritos->map(function ($cliente) {
                return [
                    'id' => $cliente->pivot->id,
                    'usuario_id' => $cliente->id,
                    'usuario_nombre' => $cliente->name,
                    'usuario_email' => $cliente->email,
                    'estado' => $cliente->pivot->estado,
                ];
            }),
            'listaEspera' => $listaEspera,
            'estadisticas' => [
                'total_inscritos' => $inscritos->count(),
                'capacidad' => $horarioClase->capacidad,
                'espacios_disponibles' => max(0, $horarioClase->capacidad - $inscritos->count()),
                'en_lista_espera' => $listaEspera->count(),
            ],
        ]);
    }

    /**
     * Promover un usuario desde la lista de espera a una reserva
     */
    public function promover(Request $request, HorarioClase $horarioClase, ListaEsperaClase $listaEspera)
    {
        // Verificar que la clase pertenece al entrenador
        if ($horarioClase->user_id !== auth()->id()) {
            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        // Verificar que la lista de espera pertenece a esta clase
        if ($listaEspera->horario_clase_id !== $horarioClase->id) {
            return response()->json(['error' => 'El usuario no está en la lista de espera de esta clase.'], 422);
        }

        // Contar inscritos actuales
        $inscritos = $horarioClase->clientes()
            ->wherePivot('estado', '!=', 'cancelado')
            ->count();

        if ($inscritos >= $horarioClase->capacidad) {
            return response()->json(['error' => 'La clase está completa. No hay espacios disponibles.'], 422);
        }

        // Crear la reserva
        \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $horarioClase->id,
            'user_id' => $listaEspera->user_id,
            'estado' => 'pendiente',
        ]);

        // Eliminar de la lista de espera
        $listaEspera->delete();

        // Reordenar posiciones
        ListaEsperaClase::reordenarPosiciones($horarioClase->id);

        // Enviar notificación al usuario promovido
        \App\Models\User::find($listaEspera->user_id)?->notify(
            new \App\Notifications\SimpleNotification(
                "¡Buenas noticias! Acabas de ser promovido a la clase: {$horarioClase->nombre}",
                "Se ha liberado un espacio en la clase que solicitaste."
            )
        );

        return response()->json(['success' => true, 'message' => 'Usuario promovido correctamente.']);
    }

    /**
     * Remover un usuario de la lista de espera
     */
    public function removerDelista(Request $request, HorarioClase $horarioClase, ListaEsperaClase $listaEspera)
    {
        // Verificar permisos
        if ($horarioClase->user_id !== auth()->id()) {
            return response()->json(['error' => 'No tienes permiso.'], 403);
        }

        if ($listaEspera->horario_clase_id !== $horarioClase->id) {
            return response()->json(['error' => 'El usuario no está en la lista de espera.'], 422);
        }

        $listaEspera->delete();
        ListaEsperaClase::reordenarPosiciones($horarioClase->id);

        return response()->json(['success' => true, 'message' => 'Usuario removido de la lista de espera.']);
    }

    /**
     * Obtener nombre del mes en español
     */
    private function getNombreMes($mes)
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];
        return $meses[$mes] ?? '';
    }
}
