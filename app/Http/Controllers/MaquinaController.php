<?php

namespace App\Http\Controllers;

use App\Models\Maquina;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaquinaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $maquinas = Maquina::orderBy('nombre')->paginate(15);
        return Inertia::render('Maquinas/Index', [
            'maquinas' => $maquinas,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Maquinas/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'required|string|max:255',
            'estado' => 'required|in:operativa,mantenimiento,fuera_de_servicio',
        ]);

        $maquina = Maquina::create($validated);

        return redirect()->route('maquinas.show', $maquina)->with('success', 'Máquina creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Maquina $maquina)
    {
        return Inertia::render('Maquinas/Show', [
            'maquina' => $maquina,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Maquina $maquina)
    {
        return Inertia::render('Maquinas/Edit', [
            'maquina' => $maquina,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Maquina $maquina)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'required|string|max:255',
            'estado' => 'required|in:operativa,mantenimiento,fuera_de_servicio',
        ]);

        $maquina->update($validated);

        return redirect()->route('maquinas.show', $maquina)->with('success', 'Máquina actualizada correctamente.');
    }

    /**
     * Cambiar el estado de la máquina (usado por botones en la UI)
     */
    public function cambiarEstado(Request $request, Maquina $maquina)
    {
        $validated = $request->validate([
            'estado' => 'required|in:operativa,mantenimiento,fuera_de_servicio',
        ]);

        $maquina->update([
            'estado' => $validated['estado'],
        ]);

        return redirect()->route('maquinas.index')->with('success', 'Estado actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Maquina $maquina)
    {
        $maquina->delete();
        return redirect()->route('maquinas.index')->with('success', 'Máquina eliminada.');
    }
}
