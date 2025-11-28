<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $entrenadores = User::role('entrenador')->get();

        return Inertia::render('Entrenadores/Index', [
            'entrenadores' => $entrenadores,
        ]);
    }

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
        $entrenador->load('clases', 'horarioTrabajo');

        return Inertia::render('Entrenadores/Show', [
            'entrenador' => $entrenador,
        ]);
    }

    public function edit(User $entrenador)
    {
        return Inertia::render('Entrenadores/Edit', [
            'entrenador' => $entrenador,
        ]);
    }

    public function update(Request $request, User $entrenador)
    {
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
        $entrenador->delete();

        return redirect()
            ->route('entrenadores.index')
            ->with('success', 'Entrenador eliminado correctamente.');
    }

    public function clasesEntrenador(Request $request)
    {
        $user = $request->user();

        $clases = $user->clases()
            ->with(['horarios.clientes'])
            ->get();

        return response()->json($clases);
    }
}
