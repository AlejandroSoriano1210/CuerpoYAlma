<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // If called via AJAX/JSON, return the latest 'limit' notifications
        if ($request->wantsJson() || $request->ajax()) {
            // Check if pagination is requested
            if ($request->has('page')) {
                $perPage = 5;
                $page = (int) $request->query('page', 1);

                $paginator = $user->notifications()->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);

                $notifications = collect($paginator->items())->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'type' => class_basename($n->type),
                        'data' => $n->data,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at->toDateTimeString(),
                    ];
                });

                return response()->json([
                    'notifications' => $notifications,
                    'unread' => $user->unreadNotifications()->count(),
                    'total' => $user->notifications()->count(),
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                ]);
            }

            // Without pagination, return limited notifications (for bell dropdown)
            $limit = (int) $request->query('limit', 3);

            $notifications = $user->notifications()->orderBy('created_at', 'desc')
                ->take($limit)->get()->map(function ($n) {
                    return [
                        'id' => $n->id,
                        'type' => class_basename($n->type),
                        'data' => $n->data,
                        'read_at' => $n->read_at,
                        'created_at' => $n->created_at->toDateTimeString(),
                    ];
                });

            return response()->json([
                'notifications' => $notifications,
                'unread' => $user->unreadNotifications()->count(),
                'total' => $user->notifications()->count(),
            ]);
        }

        // Default: render Inertia page with paginated notifications
        $perPage = 15;
        $notifications = $user->notifications()->orderBy('created_at', 'desc')->paginate($perPage);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications->through(function ($n) {
                return [
                    'id' => $n->id,
                    'type' => class_basename($n->type),
                    'data' => $n->data,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at->toDateTimeString(),
                ];
            }),
            'unread' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = $user->notifications()->where('id', $id)->first();

        if (! $notification) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function deleteRead(Request $request)
    {
        $user = $request->user();

        // Eliminar todas las notificaciones leídas del usuario
        $deleted = $user->readNotifications()->delete();

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        // Marcar todas las notificaciones no leídas como leídas
        $user->unreadNotifications->markAsRead();

        return response()->json([
            'success' => true,
        ]);
    }

    public function aceptarListaEspera(Request $request, $notificationId)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $notificationId)->first();

        if (!$notification) {
            return response()->json(['error' => 'Notificación no encontrada'], 404);
        }

        $data = $notification->data;

        // Verificar que es una notificación de lista de espera
        if (!isset($data['tipo']) || $data['tipo'] !== 'lista_espera_disponible') {
            return response()->json(['error' => 'Notificación inválida'], 422);
        }

        $horarioId = $data['horario_clase_id'] ?? null;
        $listaEsperaId = $data['lista_espera_id'] ?? null;

        if (!$horarioId || !$listaEsperaId) {
            return response()->json(['error' => 'Datos incompletos'], 422);
        }

        // Buscar el registro de lista de espera
        $listaEspera = \App\Models\ListaEsperaClase::find($listaEsperaId);

        if (!$listaEspera) {
            return response()->json(['error' => 'Ya no estás en la lista de espera'], 422);
        }

        if ($listaEspera->user_id !== $user->id) {
            return response()->json(['error' => 'No tienes permiso'], 403);
        }

        $horario = \App\Models\HorarioClase::find($horarioId);

        if (!$horario) {
            return response()->json(['error' => 'Clase no encontrada'], 404);
        }

        // Verificar si hay espacio
        $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
        if ($inscritos >= $horario->capacidad) {
            return response()->json(['error' => 'La clase ya está completa'], 422);
        }

        // Crear la reserva
        \App\Models\HorarioClaseUser::create([
            'horario_clase_id' => $horario->id,
            'user_id' => $user->id,
            'estado' => 'pendiente',
        ]);

        // Eliminar de la lista de espera
        $listaEspera->delete();

        // Reordenar posiciones
        \App\Models\ListaEsperaClase::reordenarPosiciones($horario->id);

        // Marcar la notificación como leída
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => '¡Reserva confirmada correctamente!',
        ]);
    }

    public function rechazarListaEspera(Request $request, $notificationId)
    {
        $user = $request->user();
        $notification = $user->notifications()->where('id', $notificationId)->first();

        if (!$notification) {
            return response()->json(['error' => 'Notificación no encontrada'], 404);
        }

        $data = $notification->data;

        // Verificar que es una notificación de lista de espera
        if (!isset($data['tipo']) || $data['tipo'] !== 'lista_espera_disponible') {
            return response()->json(['error' => 'Notificación inválida'], 422);
        }

        $listaEsperaId = $data['lista_espera_id'] ?? null;
        $horarioId = $data['horario_clase_id'] ?? null;

        if (!$listaEsperaId || !$horarioId) {
            return response()->json(['error' => 'Datos incompletos'], 422);
        }

        // Buscar el registro de lista de espera
        $listaEspera = \App\Models\ListaEsperaClase::find($listaEsperaId);

        if ($listaEspera && $listaEspera->user_id === $user->id) {
            // Eliminar de la lista de espera
            $listaEspera->delete();

            // Reordenar posiciones
            \App\Models\ListaEsperaClase::reordenarPosiciones($horarioId);

            // Buscar el horario de la clase
            $horario = \App\Models\HorarioClase::find($horarioId);

            if ($horario) {
                // Verificar si aún hay espacio disponible
                $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
                $espacioDisponible = $horario->capacidad - $inscritos;

                if ($espacioDisponible > 0) {
                    // Obtener el siguiente en la lista de espera (posición 1)
                    $siguienteEnLista = \App\Models\ListaEsperaClase::where('horario_clase_id', $horarioId)
                        ->where('posicion', 1)
                        ->first();

                    if ($siguienteEnLista) {
                        // Notificar al siguiente usuario
                        \Illuminate\Support\Facades\Notification::send(
                            \App\Models\User::find($siguienteEnLista->user_id),
                            new \App\Notifications\SimpleNotification(
                                "¡Hay un lugar disponible en la clase '{$horario->nombre}' del {$horario->fecha->format('d/m/Y')}! ¿Deseas reservar tu plaza?",
                                route('clases.show', $horario->id),
                                [
                                    'tipo' => 'lista_espera_disponible',
                                    'horario_clase_id' => $horario->id,
                                    'lista_espera_id' => $siguienteEnLista->id,
                                ]
                            )
                        );
                    }
                }
            }
        }

        // Marcar la notificación como leída
        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Has rechazado la reserva',
        ]);
    }
}
