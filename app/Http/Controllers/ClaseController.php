<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\HorarioTrabajo;
use App\Models\GimnasioHorario;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $mes = (int) $request->input('mes', now()->month);
        $ano = (int) $request->input('ano', now()->year);
        $tipoClase = $request->string('tipo_clase', '')->toString();

        $momento = $request->string('momento')->toString();
        $momentoValido = in_array($momento, ['manana', 'tarde'], true) ? $momento : null;

        $horarios = HorarioClase::with(['clase', 'entrenador', 'clientes', 'listaEspera'])
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $ano)
            ->when(!empty($tipoClase), function($q) use ($tipoClase) {
                return $q->whereHas('clase', fn($q) => $q->where('tipo_clase', $tipoClase));
            })
            ->when($momentoValido === 'manana', fn($q) => $q->whereTime('hora_inicio', '<', '14:00:00'))
            ->when($momentoValido === 'tarde', fn($q) => $q->whereTime('hora_inicio', '>=', '14:00:00'))
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get()
            ->map(function ($horario) {
                $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
                $capacidad = $horario->clase->capacidad;

                // Verificar si el usuario actual tiene reserva
                $reservado = false;
                $reservaId = null;
                $enListaEspera = false;
                $listaEsperaId = null;
                $posicionListaEspera = null;

                if (auth()->check()) {
                    $miReserva = \App\Models\HorarioClaseUser::where('horario_clase_id', $horario->id)
                        ->where('user_id', auth()->id())
                        ->where('estado', '!=', 'cancelado')
                        ->first();

                    if ($miReserva) {
                        $reservado = true;
                        $reservaId = $miReserva->id;
                    }

                    $miListaEspera = \App\Models\ListaEsperaClase::where('horario_clase_id', $horario->id)
                        ->where('user_id', auth()->id())
                        ->first();

                    if ($miListaEspera) {
                        $enListaEspera = true;
                        $listaEsperaId = $miListaEspera->id;
                        $posicionListaEspera = $miListaEspera->posicion;
                    }
                }

                return [
                    'id' => $horario->id,
                    'clase_id' => $horario->clase_id,
                    'nombre' => $horario->clase->nombre,
                    'tipo_clase' => $horario->clase->tipo_clase,
                    'entrenador' => $horario->entrenador->name,
                    'entrenador_id' => $horario->user_id,
                    'fecha' => $horario->fecha?->format('Y-m-d'),
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_fin' => $horario->hora_fin,
                    'inscritos' => $inscritos,
                    'capacidad' => $capacidad,
                    'completa' => $inscritos >= $capacidad,
                    'reservado' => $reservado,
                    'reserva_id' => $reservaId,
                    'en_lista_espera' => $enListaEspera,
                    'lista_espera_id' => $listaEsperaId,
                    'posicion_lista_espera' => $posicionListaEspera,
                    'lista_espera_count' => $horario->listaEspera->count(),
                ];
            });

        return Inertia::render('Clases/Index', [
            'horarios' => $horarios,
            'mes' => $mes,
            'ano' => $ano,
            'mesNombre' => Carbon::createFromDate($ano, $mes, 1)->locale('es')->monthName,
            'filtros' => [
                'tipo_clase' => $tipoClase,
                'momento' => $momentoValido,
            ],
            'tiposClases' => Clase::whereNotNull('tipo_clase')->distinct()->pluck('tipo_clase')->values(),
            'entrenadores' => User::role(['entrenador', 'jefe_entrenadores'])
                ->with('horarioTrabajo')
                ->get()
                ->map(function ($entrenador) {
                    return [
                        'id' => $entrenador->id,
                        'name' => $entrenador->name,
                        'horarios' => $entrenador->horarioTrabajo
                            ->groupBy('dia_semana')
                            ->map(function ($horariosDelDia, $dia) {
                                // Mapear nombre del día a número (1=Lunes, 7=Domingo)
                                $diasMapping = [
                                    'Lunes' => 1,
                                    'Martes' => 2,
                                    'Miércoles' => 3,
                                    'Jueves' => 4,
                                    'Viernes' => 5,
                                    'Sábado' => 6,
                                    'Domingo' => 7
                                ];

                                $nombreDia = $dia;

                                // Si $dia es un número (0-5 o 1-7), convertir apropiadamente
                                if (is_numeric($dia)) {
                                    $numeroDia = (int)$dia;
                                    // Si está en rango 0-5 (0=Lunes, 5=Sábado), convertir a 1-7
                                    if ($numeroDia >= 0 && $numeroDia <= 5) {
                                        $numeroDia = $numeroDia + 1;
                                    }
                                    // Obtener el nombre del día
                                    $diasNumMapping = [1 => 'Lunes', 2 => 'Martes', 3 => 'Miércoles', 4 => 'Jueves', 5 => 'Viernes', 6 => 'Sábado', 7 => 'Domingo'];
                                    $nombreDia = $diasNumMapping[$numeroDia] ?? $dia;
                                } else {
                                    // Si es string, buscar en mapping
                                    $numeroDia = $diasMapping[$dia] ?? 0;
                                    if ($numeroDia === 0) {
                                        // Intentar normalizado
                                        $diaNormalizado = trim($dia);
                                        $numeroDia = $diasMapping[$diaNormalizado] ?? 0;
                                    }
                                }

                                $horariosFormateados = $horariosDelDia->map(function ($h) {
                                    return substr($h->hora_inicio, 0, 5) . ' - ' . substr($h->hora_fin, 0, 5);
                                })->join(' / ');

                                // Crear string con rangos de horas para validación
                                $rangos = $horariosDelDia->map(function ($h) {
                                    return substr($h->hora_inicio, 0, 5) . ' - ' . substr($h->hora_fin, 0, 5);
                                })->join(', ');

                                return [
                                    'dia' => $nombreDia,
                                    'dia_semana' => $numeroDia,
                                    'horarios' => $horariosFormateados,
                                    'rangos' => $rangos,
                                ];
                            })
                            ->values(),
                    ];
                }),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Clases/Create');
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
            'fecha' => 'required|date|after:today',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'descripcion' => 'nullable|string',
            'tipo_clase' => 'nullable|string|max:100',
            'user_id' => 'nullable|exists:users,id',
            'semanal' => 'nullable|boolean',
        ]);
        // Si es superusuario puede asignar el entrenador; si no, es el propio auth user
        if (auth()->user()->hasRole('superusuario') && !empty($validated['user_id'])) {
            $entrenador = User::find($validated['user_id']);
            if (!$entrenador || !$entrenador->hasAnyRole(['entrenador', 'jefe_entrenadores'])) {
                return back()->with('error', 'Selecciona un entrenador válido.');
            }
            $userId = $validated['user_id'];
        } else {
            $userId = auth()->id();
        }

        // Validar que la clase esté dentro del horario de trabajo del entrenador
        $fecha = Carbon::parse($validated['fecha']);

        // Mapeo de nombres de días para buscar en la BD
        $diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        $diaSemanaCarbon = $fecha->dayOfWeek; // 0=Domingo, 1=Lunes, ..., 6=Sábado
        $nombreDia = $diasSemana[$diaSemanaCarbon];

        $horariosEntrenador = HorarioTrabajo::where('user_id', $userId)
            ->where('dia_semana', $nombreDia)
            ->get();

        if ($horariosEntrenador->isEmpty()) {
            return back()
                ->withInput()
                ->withErrors(['user_id' => "El entrenador no tiene horario de trabajo asignado para {$nombreDia}."]);
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

            return back()
                ->withInput()
                ->withErrors(['user_id' => "La clase debe estar dentro del horario de trabajo del entrenador para {$nombreDia}: {$horariosTexto}"]);
        }

        // Validar que la clase también esté dentro del horario del gimnasio
        $horarioGimnasio = GimnasioHorario::where('dia_semana', $nombreDia)->first();

        if (!$horarioGimnasio) {
            return back()
                ->withInput()
                ->withErrors(['fecha' => "El gimnasio no tiene horario asignado para {$nombreDia}."]);
        }

        $horaAperturaGimnasio = substr($horarioGimnasio->hora_apertura, 0, 5);
        $horaCierreGimnasio = substr($horarioGimnasio->hora_cierre, 0, 5);

        if ($horaInicio < $horaAperturaGimnasio || $horaFin > $horaCierreGimnasio) {
            return back()
                ->withInput()
                ->withErrors(['hora_inicio' => "La clase debe estar dentro del horario del gimnasio para {$nombreDia}: {$horaAperturaGimnasio} - {$horaCierreGimnasio}"]);
        }

        // Crear o usar la Clase base
        $clase = Clase::firstOrCreate(
            [
                'user_id' => $userId,
                'nombre' => $validated['nombre'],
            ],
            [
                'capacidad' => $validated['capacidad'],
                'tipo_clase' => $validated['tipo_clase'] ?? null,
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
        } else {
            // Crear una sola instancia
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
            $clasesCreadas = 1;
            $mensaje = 'Clase creada correctamente.';
        }

        return back()->with('success', $mensaje);
    }

    /**
     * Display the specified resource.
     */
    public function show(HorarioClase $horarioClase)
    {
        $horarioClase->load(['clase', 'user', 'clientes']);

        // Contar solo reservas no canceladas
        $inscritos = $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
        $capacidad = $horarioClase->clase->capacidad;

        // Verificar si el usuario actual tiene reserva
        $reservado = false;
        $reservaId = null;
        $enListaEspera = false;
        $listaEsperaId = null;

        if (auth()->check()) {
            $miReserva = \App\Models\HorarioClaseUser::where('horario_clase_id', $horarioClase->id)
                ->where('user_id', auth()->id())
                ->where('estado', '!=', 'cancelado')
                ->first();

            if ($miReserva) {
                $reservado = true;
                $reservaId = $miReserva->id;
            }

            $miListaEspera = \App\Models\ListaEsperaClase::where('horario_clase_id', $horarioClase->id)
                ->where('user_id', auth()->id())
                ->first();

            if ($miListaEspera) {
                $enListaEspera = true;
                $listaEsperaId = $miListaEspera->id;
            }
        }

        return Inertia::render('Clases/Show', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre_clase' => $horarioClase->clase->nombre,
                'tipo_clase' => $horarioClase->clase->tipo_clase,
                'entrenador' => $horarioClase->user->name,
                'fecha' => $horarioClase->fecha,
                'hora_inicio' => $horarioClase->hora_inicio,
                'hora_fin' => $horarioClase->hora_fin,
                'inscritos' => $inscritos,
                'capacidad' => $capacidad,
                'completa' => $inscritos >= $capacidad,
                'clientes' => $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->get(['id', 'name', 'email']),
                'reservado' => $reservado,
                'reserva_id' => $reservaId,
                'en_lista_espera' => $enListaEspera,
                'lista_espera_id' => $listaEsperaId,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Clase $clase)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Clase $clase)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Clase $clase)
    {
        //
    }
}
