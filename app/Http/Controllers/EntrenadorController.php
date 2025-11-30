<?php

namespace App\Http\Controllers;

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
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            $user->assignRole('entrenador');

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

        $entrenador->load('clasesCreadas', 'horarioTrabajo');

        return Inertia::render('Entrenadores/Show', [
            'entrenador' => [
                'id' => $entrenador->id,
                'name' => $entrenador->name,
                'email' => $entrenador->email,
                'created_at' => $entrenador->created_at,
                'updated_at' => $entrenador->updated_at,
                'clasesCreadas' => $entrenador->clasesCreadas->map(function ($clase) {
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
