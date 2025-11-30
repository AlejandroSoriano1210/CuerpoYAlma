<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index()
    {
        $clientes = User::role('cliente')
            ->withCount('clasesReservadas')
            ->get();

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Clientes/Create');
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

            $user->assignRole('cliente');

            return redirect()
                ->route('clientes.index')
                ->with('success', 'Cliente creado correctamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al crear el cliente.']);
        }
    }

    public function show(User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $cliente->load('clasesReservadas.entrenador');

        return Inertia::render('Clientes/Show', [
            'cliente' => [
                'id' => $cliente->id,
                'name' => $cliente->name,
                'email' => $cliente->email,
                'created_at' => $cliente->created_at,
                'updated_at' => $cliente->updated_at,
                'clasesReservadas' => $cliente->clasesReservadas->map(function ($clase) {
                    return [
                        'id' => $clase->id,
                        'nombre' => $clase->nombre,
                        'entrenador' => $clase->entrenador->name,
                        'fecha' => $clase->fecha->format('Y-m-d'),
                        'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                        'hora_fin' => substr($clase->hora_fin, 0, 5),
                    ];
                }),
            ],
        ]);
    }

    public function edit(User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        return Inertia::render('Clientes/Edit', [
            'cliente' => $cliente,
        ]);
    }

    public function update(Request $request, User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $cliente->id,
        ]);

        $cliente->update($validated);

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $cliente->delete();

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente eliminado correctamente.');
    }
}
