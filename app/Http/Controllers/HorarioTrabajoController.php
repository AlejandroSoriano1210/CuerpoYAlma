<?php

namespace App\Http\Controllers;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EntrenadorController extends Controller
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'horarios' => 'nullable|array'
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            $user->assignRole('entrenador');

            if (!empty($validated['horarios'])) {
                foreach ($validated['horarios'] as $horario) {
                    HorarioTrabajo::create([
                        'user_id' => $user->id,
                        'dia_semana' => $horario['dia_semana'],
                        'hora_inicio' => $horario['hora_inicio'],
                        'hora_fin' => $horario['hora_fin'],
                    ]);
                }
            }

            return redirect()
                ->route('entrenadores.index')
                ->with('success', 'Entrenador creado correctamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al crear el entrenador.']);
        }
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
            });

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
                        'inscritos' => $clase->clientes()->count(),
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

        $clases = $user->clasesCreadas()
            ->with('clientes')
            ->get();

        return response()->json($clases);
    }
}
