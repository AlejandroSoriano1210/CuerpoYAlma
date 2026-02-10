<?php

namespace App\Http\Controllers;

use App\Models\Maquina;
use App\Models\MaquinaReporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('imagen')) {
            $validated['imagen_path'] = $request->file('imagen')->store('maquinas', 'public');
        }

        $maquina = Maquina::create($validated);

        return redirect()->route('maquinas.show', $maquina)->with('success', 'Máquina creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Maquina $maquina)
    {
        // Cargar reportes con el técnico
        $maquina->load(['reportes.tecnico']);

        // Calcular estadísticas
        $estadisticas = [
            'total_reparaciones' => $maquina->reportes->sum('coste_reparacion'),
            'veces_en_reparacion' => $maquina->reportes->count(),
            'fecha_registro' => $maquina->created_at,
        ];

        return Inertia::render('Maquinas/Show', [
            'maquina' => $maquina,
            'reportes' => $maquina->reportes,
            'estadisticas' => $estadisticas,
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
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'remove_imagen' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_imagen') && $maquina->imagen_path) {
            Storage::disk('public')->delete($maquina->imagen_path);
            $validated['imagen_path'] = null;
        }

        if ($request->hasFile('imagen')) {
            if ($maquina->imagen_path) {
                Storage::disk('public')->delete($maquina->imagen_path);
            }
            $validated['imagen_path'] = $request->file('imagen')->store('maquinas', 'public');
        }

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
        if ($maquina->imagen_path) {
            Storage::disk('public')->delete($maquina->imagen_path);
        }
        $maquina->delete();
        return redirect()->route('maquinas.index')->with('success', 'Máquina eliminada.');
    }

    /**
     * Guardar un reporte de reparación de la máquina
     */
    public function storeReporte(Request $request, Maquina $maquina)
    {
        $validated = $request->validate([
            'estado_anterior' => 'required|in:mantenimiento,fuera_de_servicio',
            'tiempo_reparacion' => 'required|integer|min:1',
            'unidad_tiempo' => 'required|in:minutos,horas,dias',
            'coste_reparacion' => 'required|numeric|min:0',
            'notas' => 'nullable|string',
        ]);

        MaquinaReporte::create([
            'maquina_id' => $maquina->id,
            'tecnico_id' => Auth::id(),
            'estado_anterior' => $validated['estado_anterior'],
            'tiempo_reparacion' => $validated['tiempo_reparacion'],
            'unidad_tiempo' => $validated['unidad_tiempo'],
            'coste_reparacion' => $validated['coste_reparacion'],
            'notas' => $validated['notas'] ?? null,
        ]);

        // Cambiar el estado de la máquina a operativa
        $maquina->update(['estado' => 'operativa']);

        return redirect()->route('maquinas.index')->with('success', 'Informe de reparación guardado y máquina marcada como operativa.');
    }
}
