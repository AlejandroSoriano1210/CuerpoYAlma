<?php

namespace App\Http\Controllers;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HorarioTrabajoController extends Controller
{
    // Listar entrenadores
    public function index()
    {
        $entrenadores = User::role('entrenador')->get();

        return Inertia::render('Entrenadores/Index', [
            'entrenadores' => $entrenadores,
        ]);
    }

    // Mostrar formulario crear
    public function create()
    {
        return Inertia::render('Entrenadores/Create');
    }

    public function store(Request $request, User $entrenador)
    {
        $validated = $request->validate([
            'semanal' => 'required|array',
            'semanal.*' => 'array',
            'semanal.*.*.hora_inicio' => 'required|date_format:H:i',
            'semanal.*.*.hora_fin' => 'required|date_format:H:i',
        ]);

        // Borrar horarios previos del entrenador y crear los nuevos
        HorarioTrabajo::where('user_id', $entrenador->id)->delete();

        foreach ($validated['semanal'] as $dia => $bloques) {
            foreach ($bloques as $bloque) {
                HorarioTrabajo::create([
                    'user_id' => $entrenador->id,
                    'dia_semana' => $dia,
                    'hora_inicio' => $bloque['hora_inicio'],
                    'hora_fin' => $bloque['hora_fin'],
                ]);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function show(User $entrenador)
    {
        if (!$entrenador->hasRole('entrenador')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un entrenador.']);
        }

        $entrenador->load('horariosClases', 'horarioTrabajo');

        $horariosPorDia = $entrenador->horarioTrabajo
            ->groupBy('dia_semana')
            ->map(function ($bloques) {
                return $bloques->map(function ($bloque) {
                    return [
                        'id' => $bloque->id,
                        'hora_inicio' => substr($bloque->hora_inicio, 0, 5),
                        'hora_fin' => substr($bloque->hora_fin, 0, 5),
                    ];
                })->values();
            })->toArray();

        // If client requested JSON, return a JSON structure suitable for the API tests
        if (request()->wantsJson()) {
            return response()->json(['semanal' => $horariosPorDia]);
        }

        return Inertia::render('Entrenadores/Show', [
            'entrenador' => [
                'id' => $entrenador->id,
                'name' => $entrenador->name,
                'email' => $entrenador->email,
                'created_at' => $entrenador->created_at,
                'updated_at' => $entrenador->updated_at,
                'horarioTrabajo' => $horariosPorDia,
                'clasesCreadas' => $entrenador->horariosClases->map(function ($clase) {
                    return [
                        'id' => $clase->id,
                        'nombre' => $clase->nombre,
                        'fecha' => $clase->fecha,
                        'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                        'hora_fin' => substr($clase->hora_fin, 0, 5),
                        'capacidad' => $clase->capacidad,
                        // Contar solo reservas no canceladas
                        'inscritos' => $clase->clientes()->wherePivot('estado', '!=', 'cancelado')->count(),
                    ];
                }),
            ],
        ]);
    }


    public function edit(User $entrenador)
    {
        if (!$entrenador->hasRole('entrenador')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un entrenador.']);
        }

        return Inertia::render('Entrenadores/Edit', [
            'entrenador' => $entrenador,
        ]);
    }

    public function update(Request $request, User $entrenador)
    {
        if (!$entrenador->hasRole('entrenador')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un entrenador.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $entrenador->id,
        ]);

        $entrenador->update($validated);

        return redirect()
            ->route('entrenadores.index')
            ->with('success', 'Entrenador actualizado correctamente.');
    }

    public function destroy(User $entrenador)
    {
        if (!$entrenador->hasRole('entrenador')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un entrenador.']);
        }

        $entrenador->delete();

        return redirect()
            ->route('entrenadores.index')
            ->with('success', 'Entrenador eliminado correctamente.');
    }

    public function clasesEntrenador(Request $request)
    {
        $user = $request->user();

        $clases = $user->horariosClases()
            ->with('clientes')
            ->get();

        return response()->json($clases);
    }
}
