<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\GimnasioHorario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HorarioClaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Si es superusuario o jefe de entrenadores, pasar lista de entrenadores para asignación
        $entrenadores = null;
        if (auth()->user()->hasAnyRole(['superusuario', 'jefe_entrenadores'])) {
            $entrenadores = \App\Models\User::role(['entrenador', 'jefe_entrenadores'])
                ->with('horarioTrabajo')
                ->get()
                ->map(function ($entrenador) {
                    return [
                        'id' => $entrenador->id,
                        'name' => $entrenador->name,
                        'horarios' => $entrenador->horarioTrabajo
                            ->groupBy('dia_semana')
                            ->map(function ($horariosDelDia, $dia) {
                                // Los dias se guardan como: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo
                                $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

                                $nombreDia = is_numeric($dia) ? $diasSemana[(int)$dia] : $dia;

                                // Agrupar los horarios del día con " / "
                                $horarios = $horariosDelDia->map(function ($h) {
                                    return substr($h->hora_inicio, 0, 5) . ' - ' . substr($h->hora_fin, 0, 5);
                                })->join(' / ');

                                return [
                                    'dia' => $nombreDia,
                                    'horarios' => $horarios,
                                ];
                            })
                            ->values(),
                    ];
                });
        }

        return Inertia::render('Clases/Create', [
            'entrenadores' => $entrenadores,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'clase_id' => 'nullable|exists:clases,id',
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1|max:50',
            'fecha' => 'required|date|after_or_equal:today',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'descripcion' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
            'semanal' => 'nullable|boolean',
        ]);

        // Si es superusuario o jefe de entrenadores puede asignar el entrenador; si no, es el propio auth user
        if (auth()->user()->hasAnyRole(['superusuario', 'jefe_entrenadores']) && !empty($validated['user_id'])) {
            $entrenador = \App\Models\User::find($validated['user_id']);
            if (!$entrenador || !$entrenador->hasAnyRole(['entrenador', 'jefe_entrenadores'])) {
                return redirect()->back()->with('error', 'Selecciona un entrenador válido.');
            }
            $userId = $validated['user_id'];
        } else {
            $userId = auth()->id();
        }

        // Validar que la clase esté dentro del horario de trabajo del entrenador
        $fecha = Carbon::parse($validated['fecha']);
        $diaSemana = $fecha->dayOfWeek; // 0=Domingo, 1=Lunes, etc.

        // Convertir al formato usado en BD: 0=Lunes, 1=Martes, etc.
        $diaSemanaDB = $diaSemana === 0 ? 6 : $diaSemana - 1;

        $horariosEntrenador = \App\Models\HorarioTrabajo::where('user_id', $userId)
            ->where('dia_semana', $diaSemanaDB)
            ->get();

        if ($horariosEntrenador->isEmpty()) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['horario' => 'El entrenador no tiene horario de trabajo asignado para ese día de la semana.']);
        }

        // Verificar que la hora de inicio y fin estén dentro de alguno de los bloques horarios del entrenador
        $horaInicio = $validated['hora_inicio'];
        $horaFin = $validated['hora_fin'];
        $dentroDeHorarioEntrenador = false;

        foreach ($horariosEntrenador as $horario) {
            $horarioInicio = substr($horario->hora_inicio, 0, 5);
            $horarioFin = substr($horario->hora_fin, 0, 5);

            if ($horaInicio >= $horarioInicio && $horaFin <= $horarioFin) {
                $dentroDeHorarioEntrenador = true;
                break;
            }
        }

        if (!$dentroDeHorarioEntrenador) {
            $horariosTexto = $horariosEntrenador->map(function($h) {
                return substr($h->hora_inicio, 0, 5) . ' - ' . substr($h->hora_fin, 0, 5);
            })->join(' / ');

            $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            $nombreDia = $diasSemana[$diaSemanaDB];

            return redirect()->back()
                ->withInput()
                ->withErrors(['horario' => "La clase debe estar dentro del horario de trabajo del entrenador para {$nombreDia}: {$horariosTexto}"]);
        }

        // Validar que la clase también esté dentro del horario del gimnasio
        $diasSemanaSpanish = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        $nombreDiaSpanish = $diasSemanaSpanish[$fecha->dayOfWeek];

        $horarioGimnasio = GimnasioHorario::where('dia_semana', $nombreDiaSpanish)->first();

        if (!$horarioGimnasio) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['horario' => "El gimnasio no tiene horario asignado para el {$nombreDiaSpanish}."]);
        }

        $horaAperturaGimnasio = substr($horarioGimnasio->hora_apertura, 0, 5);
        $horaCierreGimnasio = substr($horarioGimnasio->hora_cierre, 0, 5);

        if ($horaInicio < $horaAperturaGimnasio || $horaFin > $horaCierreGimnasio) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['horario' => "La clase debe estar dentro del horario del gimnasio para {$nombreDiaSpanish}: {$horaAperturaGimnasio} - {$horaCierreGimnasio}"]);
        }

        // Crear o usar la Clase base
        $clase = \App\Models\Clase::firstOrCreate(
            [
                'user_id' => $userId,
                'nombre' => $validated['nombre'],
                'capacidad' => $validated['capacidad'],
            ]
        );

        // Si es clase semanal, crear múltiples instancias
        $esSemanal = $request->boolean('semanal', false);
        $clasesCreadas = 0;

        if ($esSemanal) {
            // Obtener todas las fechas del mismo día de la semana hasta fin de mes
            $fechaInicial = Carbon::parse($validated['fecha']);
            $finMes = $fechaInicial->copy()->endOfMonth();
            $fechaActual = $fechaInicial->copy();
            $hoy = Carbon::today();

            while ($fechaActual->lte($finMes)) {
                // Solo crear si la fecha es futura
                if ($fechaActual->gt($hoy)) {
                    HorarioClase::create([
                        'user_id' => $userId,
                        'clase_id' => $clase->id,
                        'nombre' => $validated['nombre'],
                        'capacidad' => $validated['capacidad'],
                        'fecha' => $fechaActual->format('Y-m-d'),
                        'hora_inicio' => $validated['hora_inicio'],
                        'hora_fin' => $validated['hora_fin'],
                        'descripcion' => $validated['descripcion'] ?? null,
                    ]);
                    $clasesCreadas++;
                }
                // Avanzar una semana
                $fechaActual->addWeek();
            }

            $mensaje = $clasesCreadas === 1
                ? 'Clase creada correctamente.'
                : "{$clasesCreadas} clases semanales creadas correctamente.";

            return redirect()->route('clases.index')->with('success', $mensaje);
        } else {
            // Crear clase única
            HorarioClase::create([
                'user_id' => $userId,
                'clase_id' => $clase->id,
                'nombre' => $validated['nombre'],
                'capacidad' => $validated['capacidad'],
                'fecha' => $validated['fecha'],
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fin' => $validated['hora_fin'],
                'descripcion' => $validated['descripcion'] ?? null,
            ]);

            return redirect()->route('clases.index')
                ->with('success', 'Clase creada correctamente.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(HorarioClase $horarioClase)
    {
        $horarioClase->load(['entrenador', 'clientes', 'listaEspera']);

        if (!$horarioClase->entrenador) {
            return redirect()->route('clases.index')
                ->with('error', 'Clase no encontrada o entrenador eliminado.');
        }

        // Contar solo reservas no canceladas
        $inscritos = $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->count();

        // comprobar si el usuario tiene reserva (no cancelada) para poder cancelar desde la vista
        $reservado = false;
        $reservaId = null;
        $enListaEspera = false;
        $listaEsperaId = null;
        $posicionListaEspera = null;

        if (auth()->check()) {
            $miReserva = \App\Models\HorarioClaseUser::where('horario_clase_id', $horarioClase->id)
                ->where('user_id', auth()->id())
                ->where('estado', '!=', 'cancelado')
                ->first();

            if ($miReserva) {
                $reservado = true;
                $reservaId = $miReserva->id;
            }

            // Comprobar si está en lista de espera
            $miListaEspera = \App\Models\ListaEsperaClase::where('horario_clase_id', $horarioClase->id)
                ->where('user_id', auth()->id())
                ->first();

            if ($miListaEspera) {
                $enListaEspera = true;
                $listaEsperaId = $miListaEspera->id;
                $posicionListaEspera = $miListaEspera->posicion;
            }
        }

        return Inertia::render('Clases/Show', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre' => $horarioClase->nombre,
                'entrenador' => $horarioClase->entrenador->name,
                'fecha' => $horarioClase->fecha?->format('Y-m-d'),
                'hora_inicio' => substr($horarioClase->hora_inicio, 0, 5),
                'hora_fin' => substr($horarioClase->hora_fin, 0, 5),
                'descripcion' => $horarioClase->descripcion,
                'inscritos' => $inscritos,
                'capacidad' => $horarioClase->capacidad,
                'completa' => $inscritos >= $horarioClase->capacidad,
                'clientes' => $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->get(['id', 'name', 'email']),
                'reservado' => $reservado,
                'reserva_id' => $reservaId,
                'en_lista_espera' => $enListaEspera,
                'lista_espera_id' => $listaEsperaId,
                'posicion_lista_espera' => $posicionListaEspera,
                'lista_espera_count' => $horarioClase->listaEspera->count(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    // Mostrar formulario de editar
    public function edit(HorarioClase $horarioClase)
    {
        // Verificar permisos
        if (
            $horarioClase->user_id !== auth()->id()
            && !auth()->user()->hasAnyRole(['superusuario', 'jefe_entrenadores'])
        ) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para editar esta clase.']);
        }

        $canChangeTrainer = auth()->user()->hasAnyRole(['superusuario', 'jefe_entrenadores']);
        $entrenadores = null;

        if ($canChangeTrainer) {
            $entrenadores = \App\Models\User::role(['entrenador', 'jefe_entrenadores'])
                ->with('horarioTrabajo')
                ->get()
                ->map(function ($entrenador) {
                    return [
                        'id' => $entrenador->id,
                        'name' => $entrenador->name,
                        'horarios' => $entrenador->horarioTrabajo
                            ->groupBy('dia_semana')
                            ->map(function ($horariosDelDia, $dia) {
                                $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                                $nombreDia = is_numeric($dia) ? $diasSemana[(int)$dia] : $dia;

                                $horarios = $horariosDelDia->map(function ($h) {
                                    return substr($h->hora_inicio, 0, 5) . ' - ' . substr($h->hora_fin, 0, 5);
                                })->join(' / ');

                                return [
                                    'dia' => $nombreDia,
                                    'horarios' => $horarios,
                                ];
                            })
                            ->values(),
                    ];
                });
        }

        return Inertia::render('Clases/Edit', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre' => $horarioClase->nombre,
                'capacidad' => $horarioClase->capacidad,
                'fecha' => $horarioClase->fecha?->format('Y-m-d'),
                'hora_inicio' => substr($horarioClase->hora_inicio, 0, 5),
                'hora_fin' => substr($horarioClase->hora_fin, 0, 5),
                'descripcion' => $horarioClase->descripcion,
                'user_id' => $horarioClase->user_id,
            ],
            'entrenadores' => $entrenadores,
            'canChangeTrainer' => $canChangeTrainer,
        ]);
    }

    // Actualizar clase
    public function update(Request $request, HorarioClase $horarioClase)
    {
        // Verificar permisos
        if (
            $horarioClase->user_id !== auth()->id()
            && !auth()->user()->hasAnyRole(['superusuario', 'jefe_entrenadores'])
        ) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso.']);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1|max:50',
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'descripcion' => 'nullable|string',
        ]);

        $canChangeTrainer = auth()->user()->hasAnyRole(['superusuario', 'jefe_entrenadores']);
        $targetUserId = $horarioClase->user_id;

        if ($canChangeTrainer && $request->filled('user_id')) {
            $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            $entrenador = \App\Models\User::find($request->input('user_id'));
            if (!$entrenador || !$entrenador->hasAnyRole(['entrenador', 'jefe_entrenadores'])) {
                return redirect()->back()->with('error', 'Selecciona un entrenador válido.');
            }

            $targetUserId = $entrenador->id;
            $validated['user_id'] = $targetUserId;
        }

        // Validar que la clase esté dentro del horario de trabajo del entrenador
        $fecha = Carbon::parse($validated['fecha']);
        // El frontend usa: 0=Lunes, 1=Martes, ..., 5=Sábado
        // Carbon::dayOfWeek(): 0=Domingo, 1=Lunes, ..., 6=Sábado
        // Convertir: restar 1 para alinear (1=Lunes en Carbon → 0=Lunes en frontend)
        $diaSemana = (string)(($fecha->dayOfWeek() - 1 + 7) % 7); // Shift para que 1 (Lunes) sea 0

        $horarioTrabajo = \App\Models\HorarioTrabajo::where('user_id', $targetUserId)
            ->where('dia_semana', $diaSemana)
            ->first();

        if (!$horarioTrabajo) {
            $nombreDia = $fecha->locale('es')->isoFormat('dddd');
            return redirect()->back()
                ->withInput()
                ->with('error', "El entrenador no trabaja los {$nombreDia}s.");
        }

        // Validar que la hora de la clase esté dentro del horario de trabajo
        $horaInicio = $validated['hora_inicio'];
        $horaFin = $validated['hora_fin'];

        if ($horaInicio < $horarioTrabajo->hora_inicio || $horaFin > $horarioTrabajo->hora_fin) {
            return redirect()->back()
                ->withInput()
                ->with('error', "La clase debe estar dentro del horario de trabajo del entrenador ({$horarioTrabajo->hora_inicio} - {$horarioTrabajo->hora_fin}).");
        }

        // Actualizar o crear la Clase asociada
        if ($horarioClase->clase_id) {
            // Actualizar la clase existente
            $horarioClase->clase()->update([
                'nombre' => $validated['nombre'],
                'capacidad' => $validated['capacidad'],
                'user_id' => $targetUserId,
            ]);
        } else {
            // Crear nueva Clase si no existía
            $clase = \App\Models\Clase::create([
                'user_id' => $targetUserId,
                'nombre' => $validated['nombre'],
                'capacidad' => $validated['capacidad'],
            ]);
            $validated['clase_id'] = $clase->id;
        }

        $horarioClase->update($validated);

        return redirect()->route('clases.index')
            ->with('success', 'Clase actualizada correctamente.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HorarioClase $horarioClase)
    {
        if ($horarioClase->user_id !== auth()->id() && !auth()->user()->hasRole('superusuario')) {
            return redirect()->back()->with('error', 'No tienes permiso.');
        }

        $horarioClase->delete();

        return redirect()->route('clases.index')
            ->with('success', 'Clase eliminada correctamente.');
    }
}
