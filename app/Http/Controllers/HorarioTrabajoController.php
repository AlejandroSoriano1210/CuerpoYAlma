<?php

namespace App\Http\Controllers;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Http\Request;

class HorarioTrabajoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user->hasRole('entrenador')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $bloques = $user->horarioTrabajo()
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy('dia_semana')
            ->map(function ($items) {
                return $items->map(function ($item) {
                    return [
                        'id'          => $item->id,
                        'hora_inicio' => $item->hora_inicio,
                        'hora_fin'    => $item->hora_fin,
                    ];
                })->values();
            });

        return response()->json([
            'semanal' => $bloques,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, User $entrenador)
    {
        $user = $request->user();

        // Solo superusuario puede guardar
        if (! $user->hasRole('superusuario')) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'semanal'   => ['required', 'array'],
            'semanal.*' => ['array'],
            'semanal.*.*.hora_inicio' => ['required', 'date_format:H:i'],
            'semanal.*.*.hora_fin'    => ['required', 'date_format:H:i', 'after:semanal.*.*.hora_inicio'],
        ]);

        // Borrar horarios previos de ese entrenador
        HorarioTrabajo::where('user_id', $entrenador->id)->delete();

        foreach ($data['semanal'] as $dia => $bloques) {
            foreach ($bloques as $bloque) {
                HorarioTrabajo::create([
                    'user_id'     => $entrenador->id,
                    'dia_semana'  => $dia,
                    'hora_inicio' => $bloque['hora_inicio'],
                    'hora_fin'    => $bloque['hora_fin'],
                ]);
            }
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $entrenador)
    {
        if (!auth()->user()->hasRole('superusuario') && auth()->id() !== $entrenador->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $bloques = $entrenador->horarioTrabajo()
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy('dia_semana')
            ->map(
                fn($items) =>
                $items->map(fn($item) => [
                    'id'          => $item->id,
                    'hora_inicio' => $item->hora_inicio,
                    'hora_fin'    => $item->hora_fin,
                ])->values()
            );

        return response()->json(['semanal' => $bloques]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HorarioTrabajo $horarioTrabajo)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HorarioTrabajo $horarioTrabajo)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HorarioTrabajo $horarioTrabajo)
    {
        //
    }
}
