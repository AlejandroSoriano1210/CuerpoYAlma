<?php

namespace App\Http\Controllers;

use App\Models\NotificacionProgramada;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class NotificacionProgramadaController extends Controller
{
    public function index(Request $request)
    {
        $query = NotificacionProgramada::with(['creador', 'usuarioDestino'])
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                    ->orWhere('mensaje', 'like', "%{$search}%");
            });
        }

        if ($request->filled('estado')) {
            if ($request->estado === 'activa') {
                $query->where('activa', true);
            } elseif ($request->estado === 'inactiva') {
                $query->where('activa', false);
            }
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_envio', $request->tipo);
        }

        $notificaciones = $query->paginate(15)->through(function ($n) {
            return [
                'id' => $n->id,
                'titulo' => $n->titulo,
                'mensaje' => $n->mensaje,
                'url' => $n->url,
                'destinatarios' => $n->destinatarios,
                'usuario_destino' => $n->usuarioDestino ? [
                    'id' => $n->usuarioDestino->id,
                    'name' => $n->usuarioDestino->name,
                ] : null,
                'tipo_envio' => $n->tipo_envio,
                'frecuencia' => $n->frecuencia,
                'dia_semana' => $n->dia_semana,
                'dia_mes' => $n->dia_mes,
                'hora_envio' => $n->hora_envio,
                'fecha_envio' => $n->fecha_envio?->format('Y-m-d'),
                'ultima_ejecucion' => $n->ultima_ejecucion?->format('Y-m-d H:i'),
                'proxima_ejecucion' => $n->proxima_ejecucion?->format('Y-m-d H:i'),
                'activa' => $n->activa,
                'creador' => $n->creador ? $n->creador->name : 'Sistema',
                'created_at' => $n->created_at->format('Y-m-d H:i'),
            ];
        });

        // Obtener usuarios para el selector de usuario específico
        $usuarios = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]);

        return Inertia::render('NotificacionesProgramadas/Index', [
            'notificaciones' => $notificaciones,
            'usuarios' => $usuarios,
            'filters' => [
                'search' => $request->search ?? '',
                'estado' => $request->estado ?? '',
                'tipo' => $request->tipo ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string|max:1000',
            'url' => 'nullable|string|max:255',
            'destinatarios' => 'required|in:todos,clientes,empleados,entrenadores,tecnicos,limpieza,usuario_especifico',
            'usuario_id' => 'nullable|required_if:destinatarios,usuario_especifico|exists:users,id',
            'tipo_envio' => 'required|in:unica_vez,recurrente',
            'frecuencia' => 'nullable|required_if:tipo_envio,recurrente|in:diaria,semanal,mensual,anual',
            'dia_semana' => 'nullable|integer|min:1|max:7',
            'dia_mes' => 'nullable|integer|min:1|max:31',
            'hora_envio' => 'required|date_format:H:i',
            'fecha_envio' => 'nullable|required_if:tipo_envio,unica_vez|date',
            'enviar_ahora' => 'nullable|boolean',
        ], [
            'titulo.required' => 'El título es obligatorio.',
            'mensaje.required' => 'El mensaje es obligatorio.',
            'destinatarios.required' => 'Debes seleccionar a quién va dirigida.',
            'usuario_id.required_if' => 'Debes seleccionar un usuario.',
            'hora_envio.required' => 'La hora de envío es obligatoria.',
            'fecha_envio.required_if' => 'La fecha de envío es obligatoria para notificaciones de una sola vez.',
            'frecuencia.required_if' => 'La frecuencia es obligatoria para notificaciones recurrentes.',
        ]);

        $notificacion = NotificacionProgramada::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'activa' => true,
        ]);

        // Si se pide enviar ahora
        if ($request->boolean('enviar_ahora')) {
            $this->enviarNotificacion($notificacion);
            $notificacion->update([
                'ultima_ejecucion' => Carbon::now(),
            ]);
        }

        // Calcular próxima ejecución
        $proxima = $notificacion->calcularProximaEjecucion();
        $notificacion->update(['proxima_ejecucion' => $proxima]);

        return redirect()->route('notificaciones-programadas.index')
            ->with('success', $request->boolean('enviar_ahora')
                ? 'Notificación creada y enviada correctamente.'
                : 'Notificación programada correctamente.'
            );
    }

    public function toggleActiva(NotificacionProgramada $notificacion)
    {
        $notificacion->update([
            'activa' => !$notificacion->activa,
            'proxima_ejecucion' => !$notificacion->activa
                ? $notificacion->calcularProximaEjecucion()
                : null,
        ]);

        return redirect()->back()->with('success',
            $notificacion->activa
                ? 'Notificación activada.'
                : 'Notificación desactivada.'
        );
    }

    public function destroy(NotificacionProgramada $notificacion)
    {
        $notificacion->delete();

        return redirect()->route('notificaciones-programadas.index')
            ->with('success', 'Notificación eliminada correctamente.');
    }

    public function enviarAhora(NotificacionProgramada $notificacion)
    {
        $this->enviarNotificacion($notificacion);

        $notificacion->update([
            'ultima_ejecucion' => Carbon::now(),
            'proxima_ejecucion' => $notificacion->tipo_envio === 'recurrente'
                ? $notificacion->calcularProximaEjecucion()
                : null,
        ]);

        return redirect()->back()->with('success', 'Notificación enviada correctamente.');
    }

    /**
     * Envía la notificación a los destinatarios correspondientes.
     */
    private function enviarNotificacion(NotificacionProgramada $notificacion): void
    {
        $notification = new \App\Notifications\SimpleNotification(
            $notificacion->mensaje,
            $notificacion->url
        );

        $usuarios = $this->obtenerDestinatarios($notificacion);

        foreach ($usuarios as $usuario) {
            $usuario->notify($notification);
        }
    }

    /**
     * Obtiene los usuarios destinatarios según la configuración.
     */
    private function obtenerDestinatarios(NotificacionProgramada $notificacion)
    {
        return match ($notificacion->destinatarios) {
            'todos' => User::all(),
            'clientes' => User::role('cliente')->get(),
            'empleados' => User::role(['entrenador', 'jefe_entrenadores', 'tecnico', 'jefe_tecnicos', 'limpieza', 'jefe_limpieza'])->get(),
            'entrenadores' => User::role('entrenador')->get(),
            'tecnicos' => User::role('tecnico')->get(),
            'limpieza' => User::role('limpieza')->get(),
            'usuario_especifico' => $notificacion->usuario_id
                ? User::where('id', $notificacion->usuario_id)->get()
                : collect(),
            default => collect(),
        };
    }
}
