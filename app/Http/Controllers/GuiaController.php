<?php

namespace App\Http\Controllers;

use App\Models\Guia;
use App\Models\GuiaAsignacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GuiaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Guia::query();

        // Filtro por nivel
        if ($request->filled('nivel')) {
            $query->where('nivel', $request->input('nivel'));
        }

        // Filtro por músculo objetivo
        if ($request->filled('musculo_objetivo')) {
            $musculo = $request->input('musculo_objetivo');
            $query->whereHas('guiaEjercicio.ejercicio', function ($q) use ($musculo) {
                $q->where('musculo_objetivo', $musculo);
            });
        }

        $guias = $query->orderBy('created_at', 'desc')->paginate(6);

        // Obtener todos los músculos únicos disponibles
        $musculos = \App\Models\Ejercicio::distinct()
            ->pluck('musculo_objetivo')
            ->filter()
            ->sort()
            ->values();

        // Obtener IDs de las guías asignadas al usuario actual
        $assignedGuiaIds = [];
        if (Auth::check()) {
            $assignedGuiaIds = \App\Models\GuiaView::where('user_id', Auth::id())
                ->pluck('guia_id')
                ->toArray();
        }

        $ejercicios = \App\Models\Ejercicio::orderBy('nombre')->get();

        return Inertia::render('Guias/Index', [
            'guias' => $guias,
            'niveles' => ['principiante', 'intermedio', 'avanzado'],
            'musculos' => $musculos,
            'assignedGuiaIds' => $assignedGuiaIds,
            'filtrosActivos' => [
                'nivel' => $request->input('nivel'),
                'musculo_objetivo' => $request->input('musculo_objetivo'),
            ],
            'ejercicios' => $ejercicios,
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

        // Obtener lista de clientes disponibles (usuarios con rol 'cliente')
        $clientes = \App\Models\User::role('cliente')->get(['id', 'name', 'email']);

        // Verificar si el usuario actual tiene asignada esta guía
        $isAssigned = false;
        $isAssignedWeekly = false;
        if (Auth::check()) {
            $isAssigned = \App\Models\GuiaView::where('user_id', Auth::id())
                ->where('guia_id', $guia->id)
                ->exists();
            $isAssignedWeekly = GuiaAsignacion::where('user_id', Auth::id())
                ->where('guia_id', $guia->id)
                ->where('frecuencia', 'semanal')
                ->exists();
        }

        return Inertia::render('Guias/Show', [
            'guia' => $guia,
            'clientes' => $clientes,
            'isAssigned' => $isAssigned,
            'isAssignedWeekly' => $isAssignedWeekly,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Guia $guia)
    {
        $guia->load(['guiaEjercicio.ejercicio']);
        $ejercicios = \App\Models\Ejercicio::orderBy('nombre')->get();

        return Inertia::render('Guias/Edit', [
            'guia' => $guia,
            'niveles' => ['principiante', 'intermedio', 'avanzado'],
            'ejercicios' => $ejercicios,
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
            'ejercicios' => 'sometimes|array',
            'ejercicios.*.ejercicio_id' => 'required_with:ejercicios|exists:ejercicios,id',
            'ejercicios.*.series' => 'nullable|integer|min:1',
            'ejercicios.*.repeticiones' => 'nullable|integer|min:1',
            'ejercicios.*.instrucciones' => 'nullable|string',
        ]);

        $guia->update($validated);

        // Actualizar ejercicios si vienen
        if (isset($validated['ejercicios'])) {
            // Eliminar ejercicios anteriores
            $guia->guiaEjercicio()->delete();

            // Agregar los nuevos ejercicios
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

    /**
     * Assign a guide to a specific client (trainer only).
     */
    public function assignToClient(Request $request, Guia $guia)
    {
        // Validar que el usuario sea entrenador o superusuario
        if (!Auth::user()->hasAnyRole(['entrenador', 'superusuario'])) {
            return back()->with('error', 'No tienes permiso para asignar guías.');
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:users,id',
            'semanal' => 'sometimes|boolean',
        ]);

        // Verificar que el usuario sea un cliente
        $cliente = \App\Models\User::findOrFail($validated['client_id']);
        if (!$cliente->hasRole('cliente')) {
            return back()->with('error', 'El usuario seleccionado no es un cliente.');
        }

        // Crear o actualizar el registro en guia_views
        \App\Models\GuiaView::firstOrCreate([
            'user_id' => $cliente->id,
            'guia_id' => $guia->id,
        ]);

        $this->syncWeeklyAssignment($cliente->id, $guia->id, (bool) ($validated['semanal'] ?? false));

        return back()->with('success', "Guía asignada a {$cliente->name} correctamente.");
    }

    /**
     * Assign a guide to the authenticated user.
     */
    public function assign(Guia $guia)
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión para asignar una guía.');
        }

        $validated = request()->validate([
            'semanal' => 'sometimes|boolean',
        ]);

        // Crear o actualizar el registro en guia_views
        \App\Models\GuiaView::firstOrCreate([
            'user_id' => Auth::id(),
            'guia_id' => $guia->id,
        ]);

        $this->syncWeeklyAssignment(Auth::id(), $guia->id, (bool) ($validated['semanal'] ?? false));

        return back()->with('success', 'Guía asignada correctamente. Ya aparecerá en tu dashboard.');
    }

    /**
     * Unassign/complete a guide for the authenticated user.
     */
    public function unassign(Guia $guia)
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Debes iniciar sesión.');
        }

        $keepWeekly = request()->boolean('keep_weekly', false);

        // Eliminar el progreso de la guía
        \App\Models\GuiaProgreso::where('user_id', Auth::id())
            ->where('guia_id', $guia->id)
            ->delete();

        // Eliminar el registro de guia_views
        \App\Models\GuiaView::where('user_id', Auth::id())
            ->where('guia_id', $guia->id)
            ->delete();

        if (!$keepWeekly) {
            GuiaAsignacion::where('user_id', Auth::id())
                ->where('guia_id', $guia->id)
                ->where('frecuencia', 'semanal')
                ->delete();
        }

        return back()->with('success', 'Guía marcada como completada y eliminada de tu dashboard.');
    }

    /**
     * Download the guide as a PDF.
     */
    public function downloadPdf(Guia $guia)
    {
        $guia->load(['guiaEjercicio.ejercicio']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.guia', ['guia' => $guia]);

        // Nombre del archivo limpio
        $filename = \Illuminate\Support\Str::slug($guia->titulo) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Save the progress of a guide exercise for the authenticated user.
     */
    public function saveProgress(Request $request, Guia $guia)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'guia_ejercicio_id' => 'required|exists:guia_ejercicios,id',
            'completado' => 'required|boolean',
        ]);

        // Verificar que el ejercicio pertenece a la guía
        $guiaEjercicio = \App\Models\GuiaEjercicio::findOrFail($validated['guia_ejercicio_id']);
        if ($guiaEjercicio->guia_id !== $guia->id) {
            return response()->json(['error' => 'El ejercicio no pertenece a esta guía'], 422);
        }

        // Crear o actualizar el registro de progreso
        $progreso = \App\Models\GuiaProgreso::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'guia_id' => $guia->id,
                'guia_ejercicio_id' => $validated['guia_ejercicio_id'],
            ],
            [
                'completado' => $validated['completado'],
            ]
        );

        // Obtener el total de ejercicios y el total completados
        $totalEjercicios = \App\Models\GuiaEjercicio::where('guia_id', $guia->id)->count();
        $completados = \App\Models\GuiaProgreso::where('user_id', Auth::id())
            ->where('guia_id', $guia->id)
            ->where('completado', true)
            ->count();

        // Si se completan todos los ejercicios, desasignar la guía
        $guiaCompletada = false;
        $asignacionSemanal = false;
        if ($completados === $totalEjercicios && $totalEjercicios > 0) {
            $guiaCompletada = true;

            $asignacionSemanal = GuiaAsignacion::where('user_id', Auth::id())
                ->where('guia_id', $guia->id)
                ->where('frecuencia', 'semanal')
                ->exists();

            // Guardar registro de completación
            \App\Models\GuiaCompletada::create([
                'user_id' => Auth::id(),
                'guia_id' => $guia->id,
                'completada_el' => now(),
            ]);

            // Eliminar la asignación de la guía
            \App\Models\GuiaView::where('user_id', Auth::id())
                ->where('guia_id', $guia->id)
                ->delete();
        }

        return response()->json([
            'success' => true,
            'completados' => $completados,
            'total' => $totalEjercicios,
            'guiaCompletada' => $guiaCompletada,
            'asignacionSemanal' => $asignacionSemanal,
        ]);
    }

    private function syncWeeklyAssignment(int $userId, int $guiaId, bool $semanal): void
    {
        if ($semanal) {
            GuiaAsignacion::firstOrCreate([
                'user_id' => $userId,
                'guia_id' => $guiaId,
                'frecuencia' => 'semanal',
            ]);
            return;
        }

        GuiaAsignacion::where('user_id', $userId)
            ->where('guia_id', $guiaId)
            ->where('frecuencia', 'semanal')
            ->delete();
    }

    /**
     * Get the progress of a guide for the authenticated user.
     */
    public function getProgress(Guia $guia)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $progreso = \App\Models\GuiaProgreso::where('user_id', Auth::id())
            ->where('guia_id', $guia->id)
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->guia_ejercicio_id => $item->completado];
            });

        return response()->json([
            'progreso' => $progreso,
        ]);
    }
}
