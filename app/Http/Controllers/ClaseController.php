<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\HorarioClase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $mes = request('mes', now()->month);
        $ano = request('ano', now()->year);

        // Obtener horarios de clases del mes
        $horarios = HorarioClase::with(['clase', 'user', 'clientes'])
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $ano)
            ->get()
            ->map(function ($horario) {
                $inscritos = $horario->clientes()->count();
                $capacidad = $horario->clase->capacidad;

                return [
                    'id' => $horario->id,
                    'clase_id' => $horario->clase_id,
                    'nombre_clase' => $horario->clase->nombre,
                    'entrenador' => $horario->user->name,
                    'fecha' => $horario->fecha,
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_fin' => $horario->hora_fin,
                    'inscritos' => $inscritos,
                    'capacidad' => $capacidad,
                    'completa' => $inscritos >= $capacidad,
                    'disponible' => $inscritos < $capacidad,
                ];
            });

        // Agrupar por fecha para el calendario
        $calendario = $horarios->groupBy('fecha');

        return Inertia::render('Clases/Index', [
            'horarios' => $horarios,
            'calendario' => $calendario,
            'mes' => $mes,
            'ano' => $ano,
            'mesNombre' => Carbon::createFromDate($ano, $mes, 1)->locale('es')->monthName,
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
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1|max:50',
            'descripcion' => 'nullable|string',
        ]);

        $clase = Clase::create([
            'user_id' => auth()->id(),
            'nombre' => $validated['nombre'],
            'capacidad' => $validated['capacidad'],
        ]);

        return redirect()->route('clases.index')
            ->with('success', 'Clase creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(HorarioClase $horarioClase)
    {
        $horarioClase->load(['clase', 'user', 'clientes']);

        $inscritos = $horarioClase->clientes()->count();
        $capacidad = $horarioClase->clase->capacidad;

        return Inertia::render('Clases/Show', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre_clase' => $horarioClase->clase->nombre,
                'entrenador' => $horarioClase->user->name,
                'fecha' => $horarioClase->fecha,
                'hora_inicio' => $horarioClase->hora_inicio,
                'hora_fin' => $horarioClase->hora_fin,
                'inscritos' => $inscritos,
                'capacidad' => $capacidad,
                'completa' => $inscritos >= $capacidad,
                'clientes' => $horarioClase->clientes()->get(['id', 'name', 'email']),
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

    public function createHorario()
    {
        $clases = Clase::where('user_id', auth()->id())->get();

        return Inertia::render('Clases/CreateHorario', [
            'clases' => $clases,
        ]);
    }

    // Guardar horario de clase
    public function storeHorario(Request $request)
    {
        $validated = $request->validate([
            'clase_id' => 'required|exists:clases,id',
            'fecha' => 'required|date|after:today',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        // Verificar que la clase pertenece al usuario autenticado
        $clase = Clase::findOrFail($validated['clase_id']);
        if ($clase->user_id !== auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para esta clase.']);
        }

        HorarioClase::create([
            'clase_id' => $validated['clase_id'],
            'user_id' => auth()->id(),
            'fecha' => $validated['fecha'],
            'hora_inicio' => $validated['hora_inicio'],
            'hora_fin' => $validated['hora_fin'],
        ]);

        return redirect()->route('clases.index')
            ->with('success', 'Horario de clase creado correctamente.');
    }

    // Editar horario de clase
    public function editHorario(HorarioClase $horarioClase)
    {
        // Verificar que es el propietario
        if ($horarioClase->user_id !== auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso.']);
        }

        $clases = Clase::where('user_id', auth()->id())->get();

        return Inertia::render('Clases/EditHorario', [
            'horario' => $horarioClase,
            'clases' => $clases,
        ]);
    }

    // Actualizar horario
    public function updateHorario(Request $request, HorarioClase $horarioClase)
    {
        if ($horarioClase->user_id !== auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso.']);
        }

        $validated = $request->validate([
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ]);

        $horarioClase->update($validated);

        return redirect()->route('clases.index')
            ->with('success', 'Horario actualizado correctamente.');
    }

    // Eliminar horario
    public function destroyHorario(HorarioClase $horarioClase)
    {
        if ($horarioClase->user_id !== auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso.']);
        }

        $horarioClase->delete();

        return redirect()->route('clases.index')
            ->with('success', 'Horario eliminado correctamente.');
    }
}
