<?php

namespace App\Http\Controllers;

use App\Models\Clase;
use App\Models\HorarioClase;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $mes = (int) $request->input('mes', now()->month);
        $ano = (int) $request->input('ano', now()->year);

        $diasSemana = collect($request->input('dias_semana', []))
            ->map(fn ($d) => (int) $d)
            ->filter(fn ($d) => $d >= 1 && $d <= 7)
            ->values();

        $momento = $request->string('momento')->toString();
        $momentoValido = in_array($momento, ['manana', 'tarde'], true) ? $momento : null;

        // Mapeo ISO (1=lunes ... 7=domingo) a MySQL DAYOFWEEK (1=domingo ... 7=sabado)
        $mapIsoToMysql = [1 => 2, 2 => 3, 3 => 4, 4 => 5, 5 => 6, 6 => 7, 7 => 1];
        $diasMysql = $diasSemana->map(fn ($d) => $mapIsoToMysql[$d])->unique()->values();

        $horarios = HorarioClase::with(['clase', 'user', 'clientes'])
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $ano)
            ->when($diasMysql->isNotEmpty(), fn ($q) => $q->whereIn(DB::raw('DAYOFWEEK(fecha)'), $diasMysql))
            ->when($momentoValido === 'manana', fn ($q) => $q->whereTime('hora_inicio', '<', '14:00:00'))
            ->when($momentoValido === 'tarde', fn ($q) => $q->whereTime('hora_inicio', '>=', '14:00:00'))
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get()
            ->map(function ($horario) {
                // Contar solo reservas no canceladas
                $inscritos = $horario->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
                $capacidad = $horario->clase->capacidad;

                return [
                    'id' => $horario->id,
                    'clase_id' => $horario->clase_id,
                    'nombre' => $horario->clase->nombre,
                    'nombre_clase' => $horario->clase->nombre,
                    'entrenador' => $horario->user->name,
                    'entrenador_id' => $horario->user_id,
                    'fecha' => $horario->fecha,
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_fin' => $horario->hora_fin,
                    'inscritos' => $inscritos,
                    'capacidad' => $capacidad,
                    'completa' => $inscritos >= $capacidad,
                    'disponible' => $inscritos < $capacidad,
                ];
            });

        // Agrupar por fecha para el calendario
        $calendario = $horarios->groupBy('fecha');

        return Inertia::render('Clases/Index', [
            'horarios' => $horarios,
            'calendario' => $calendario,
            'mes' => $mes,
            'ano' => $ano,
            'mesNombre' => Carbon::createFromDate($ano, $mes, 1)->locale('es')->monthName,
            'filtros' => [
                'dias_semana' => $diasSemana,
                'momento' => $momentoValido,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Clases/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1|max:50',
            'descripcion' => 'nullable|string',
        ]);

        $clase = Clase::create([
            'user_id' => auth()->id(),
            'nombre' => $validated['nombre'],
            'capacidad' => $validated['capacidad'],
        ]);

        return redirect()->route('clases.index')
            ->with('success', 'Clase creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(HorarioClase $horarioClase)
    {
        $horarioClase->load(['clase', 'user', 'clientes']);

        // Contar solo reservas no canceladas
        $inscritos = $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->count();
        $capacidad = $horarioClase->clase->capacidad;

        return Inertia::render('Clases/Show', [
            'horario' => [
                'id' => $horarioClase->id,
                'nombre_clase' => $horarioClase->clase->nombre,
                'entrenador' => $horarioClase->user->name,
                'fecha' => $horarioClase->fecha,
                'hora_inicio' => $horarioClase->hora_inicio,
                'hora_fin' => $horarioClase->hora_fin,
                'inscritos' => $inscritos,
                'capacidad' => $capacidad,
                'completa' => $inscritos >= $capacidad,
                'clientes' => $horarioClase->clientes()->wherePivot('estado', '!=', 'cancelado')->get(['id', 'name', 'email']),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Clase $clase)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Clase $clase)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Clase $clase)
    {
        //
    }

}
