<?php

namespace App\Http\Controllers;

use App\Models\Ejercicio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EjercicioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ejercicios = Ejercicio::orderBy('nombre')->paginate(15);
        return Inertia::render('Ejercicios/Index', [
            'ejercicios' => $ejercicios,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Ejercicios/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'musculo_objetivo' => 'nullable|string|max:255',
        ]);

        $ejercicio = Ejercicio::create($validated);

        return redirect()->route('ejercicios.show', $ejercicio)->with('success', 'Ejercicio creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Ejercicio $ejercicio)
    {
        return Inertia::render('Ejercicios/Show', [
            'ejercicio' => $ejercicio,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ejercicio $ejercicio)
    {
        return Inertia::render('Ejercicios/Edit', [
            'ejercicio' => $ejercicio,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ejercicio $ejercicio)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'musculo_objetivo' => 'nullable|string|max:255',
        ]);

        $ejercicio->update($validated);

        return redirect()->route('ejercicios.show', $ejercicio)->with('success', 'Ejercicio actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ejercicio $ejercicio)
    {
        $ejercicio->delete();
        return redirect()->route('ejercicios.index')->with('success', 'Ejercicio eliminado.');
    }
}
