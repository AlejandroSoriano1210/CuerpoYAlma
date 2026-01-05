<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
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
        $mes = (int) request('mes', now()->month);
        $ano = (int) request('ano', now()->year);

        if ($mes < 1 || $mes > 12) {
            $mes = now()->month;
        }
        if ($ano < 2000 || $ano > 2100) {
            $ano = now()->year;
        }

        // Obtener horarios de clases del mes
        $horarios = HorarioClase::with(['entrenador', 'clientes'])
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $ano)
            ->get()
            ->map(function ($horario) {
                $inscritos = $horario->clientes()->count();

                // Si el usuario está autenticado, comprobar si tiene reserva y obtener su id
                $reservado = false;
                $reservaId = null;
                if (auth()->check()) {
                    $miReserva = \App\Models\HorarioClaseUser::where('horario_clase_id', $horario->id)
                        ->where('user_id', auth()->id())
                        ->where('estado', 'confirmado')
                        ->first();

                    if ($miReserva) {
                        $reservado = true;
                        $reservaId = $miReserva->id;
                    }
                }

                return [
                    'id' => $horario->id,
                    'nombre' => $horario->nombre,
                    'entrenador' => $horario->entrenador->name,
                    'entrenador_id' => $horario->user_id,
                    'fecha' => $horario->fecha->format('Y-m-d'),
                    'hora_inicio' => substr($horario->hora_inicio, 0, 5),
                    'hora_fin' => substr($horario->hora_fin, 0, 5),
                    'inscritos' => $inscritos,
                    'capacidad' => $horario->capacidad,
                    'completa' => $inscritos >= $horario->capacidad,
                    'disponible' => $inscritos < $horario->capacidad,
                    'reservado' => $reservado,
                    'reserva_id' => $reservaId,
                ];
            });


        return Inertia::render('Clases/Index', [
            'horarios' => $horarios,
            'mes' => $mes,
            'ano' => $ano,
            'mesNombre' => Str::ucfirst(Carbon::createFromDate($ano, $mes, 1)->locale('es')->monthName),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Si es superusuario, pasar lista de entrenadores para asignación
        $entrenadores = null;
        if (auth()->user()->hasRole('superusuario')) {
            $entrenadores = \App\Models\User::role('entrenador')->get(['id', 'name']);
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
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1|max:50',
            'fecha' => 'required|date|after:today',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'descripcion' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        // Si es superusuario puede asignar el entrenador; si no, es el propio auth user
        if (auth()->user()->hasRole('superusuario') && !empty($validated['user_id'])) {
            $entrenador = \App\Models\User::find($validated['user_id']);
            if (!$entrenador || !$entrenador->hasRole('entrenador')) {
                return redirect()->back()->with('error', 'Selecciona un entrenador válido.');
            }
            $userId = $validated['user_id'];
        } else {
            $userId = auth()->id();
        }

        HorarioClase::create([
            'user_id' => $userId,
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

    /**
     * Display the specified resource.
     */
    public function show(HorarioClase $horarioClase)
    {
        $horarioClase->load(['entrenador', 'clientes']);

        if (!$horarioClase->entrenador) {
            return redirect()->route('clases.index')
                ->with('error', 'Clase no encontrada o entrenador eliminado.');
        }

        $inscritos = $horarioClase->clientes()->count();

        return Inertia::render('Clases/Show', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre' => $horarioClase->nombre,
                'entrenador' => $horarioClase->entrenador->name,
                'fecha' => $horarioClase->fecha,
                'hora_inicio' => substr($horarioClase->hora_inicio, 0, 5),
                'hora_fin' => substr($horarioClase->hora_fin, 0, 5),
                'descripcion' => $horarioClase->descripcion,
                'inscritos' => $inscritos,
                'capacidad' => $horarioClase->capacidad,
                'completa' => $inscritos >= $horarioClase->capacidad,
                'clientes' => $horarioClase->clientes()->get(['id', 'name', 'email']),
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
        if ($horarioClase->user_id !== auth()->id() && !auth()->user()->hasRole('superusuario')) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para editar esta clase.']);
        }

        return Inertia::render('Clases/Edit', [
            'horario' => $horarioClase,
        ]);
    }

    // Actualizar clase
    public function update(Request $request, HorarioClase $horarioClase)
    {
        // Verificar permisos
        if ($horarioClase->user_id !== auth()->id() && !auth()->user()->hasRole('superusuario')) {
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
