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

}
