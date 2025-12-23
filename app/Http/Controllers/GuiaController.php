<?php

namespace App\Http\Controllers;

use App\Models\Guia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuiaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $guias = Guia::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Guias/Index', [
            'guias' => $guias,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $ejercicios = \App\Models\Ejercicio::orderBy('nombre')->get();

        return Inertia::render('Guias/Create', [
            'niveles' => ['principiante', 'intermedio', 'avanzado'],
            'ejercicios' => $ejercicios,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'contenido' => 'nullable|string',
            'nivel' => 'required|in:principiante,intermedio,avanzado',
            'ejercicios' => 'sometimes|array',
            'ejercicios.*.ejercicio_id' => 'required_with:ejercicios|exists:ejercicios,id',
            'ejercicios.*.series' => 'nullable|integer|min:1',
            'ejercicios.*.repeticiones' => 'nullable|integer|min:1',
            'ejercicios.*.instrucciones' => 'nullable|string',
        ]);

        $guia = Guia::create($validated);

        // Guardar ejercicios si vienen
        if (!empty($validated['ejercicios'])) {
            $orden = 1;
            foreach ($validated['ejercicios'] as $item) {
                $guia->guiaEjercicio()->create([
                    'ejercicio_id' => $item['ejercicio_id'],
                    'series' => $item['series'] ?? null,
                    'repeticiones' => $item['repeticiones'] ?? null,
                    'instrucciones' => $item['instrucciones'] ?? null,
                    'orden' => $orden++,
                ]);
            }
        }

        return redirect()->route('guias.show', $guia)->with('success', 'Guía creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Guia $guia)
    {
        $guia->load(['guiaEjercicio.ejercicio']);

        // Registrar que el usuario ha utilizado / visto esta guía
        if (auth()->check()) {
            \App\Models\GuiaView::firstOrCreate([
                'user_id' => auth()->id(),
                'guia_id' => $guia->id,
            ]);
        }

        return Inertia::render('Guias/Show', [
            'guia' => $guia,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Guia $guia)
    {
        return Inertia::render('Guias/Edit', [
            'guia' => $guia,
            'niveles' => ['principiante', 'intermedio', 'avanzado'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Guia $guia)
    {
        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'contenido' => 'nullable|string',
            'nivel' => 'required|in:principiante,intermedio,avanzado',
        ]);

        $guia->update($validated);

        return redirect()->route('guias.show', $guia)->with('success', 'Guía actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Guia $guia)
    {
        $guia->delete();

        return redirect()->route('guias.index')->with('success', 'Guía eliminada correctamente.');
    }
}
