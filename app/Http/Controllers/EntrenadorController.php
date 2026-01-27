<?php

namespace App\Http\Controllers;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EntrenadorController extends Controller
{
    // Listar entrenadores
    public function index(Request $request)
    {
        $search = $request->query('search', '');

        $query = User::role('entrenador');

        if (!empty($search)) {
            $query->whereRaw("LOWER(CONVERT(name USING utf8mb4) COLLATE utf8mb4_unicode_ci) LIKE LOWER(CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci)", ["%{$search}%"])
                  ->orWhereRaw("LOWER(CONVERT(email USING utf8mb4) COLLATE utf8mb4_unicode_ci) LIKE LOWER(CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci)", ["%{$search}%"]);
        }

        $entrenadores = $query->get();

        return Inertia::render('Entrenadores/Index', [
            'entrenadores' => $entrenadores,
            'search' => $search,
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
            'horarios' => 'nullable|array',
            'horarios.*.dia_semana' => 'required|integer|between:0,5',
            'horarios.*.hora_inicio' => 'required|date_format:H:i',
            'horarios.*.hora_fin' => 'required|date_format:H:i',
        ]);

        // Validar que el total de horas no supere 40
        if (!empty($validated['horarios'])) {
            $totalHoras = 0;
            foreach ($validated['horarios'] as $horario) {
                $inicio = \Carbon\Carbon::createFromFormat('H:i', $horario['hora_inicio']);
                $fin = \Carbon\Carbon::createFromFormat('H:i', $horario['hora_fin']);
                $diferencia = $fin->diffInMinutes($inicio) / 60;
                $totalHoras += $diferencia;
            }
            if ($totalHoras > 40) {
                return redirect()
                    ->back()
                    ->withInput()
                    ->withErrors(['horarios' => "El total de horas no puede superar 40. Total actual: $totalHoras horas."]);
            }
        }

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            $user->assignRole('entrenador');

            if (!empty($validated['horarios'])) {
                foreach ($validated['horarios'] as $horario) {
                    HorarioTrabajo::create([
                        'user_id' => $user->id,
                        'dia_semana' => $horario['dia_semana'],
                        'hora_inicio' => $horario['hora_inicio'],
                        'hora_fin' => $horario['hora_fin'],
                    ]);
                }
            }

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

        $entrenador->load('horariosClases', 'horarioTrabajo');

        $horariosPorDia = $entrenador->horarioTrabajo
            ->groupBy('dia_semana')
            ->map(function ($bloques) {
                return $bloques->map(function ($bloque) {
                    return [
                        'id' => $bloque->id,
                        'hora_inicio' => substr($bloque->hora_inicio, 0, 5),
                        'hora_fin' => substr($bloque->hora_fin, 0, 5),
                    ];
                })->values();
            });

        return Inertia::render('Entrenadores/Show', [
            'entrenador' => [
                'id' => $entrenador->id,
                'name' => $entrenador->name,
                'email' => $entrenador->email,
                'created_at' => $entrenador->created_at,
                'updated_at' => $entrenador->updated_at,
                'horarioTrabajo' => $horariosPorDia,
                'clasesCreadas' => $entrenador->horariosClases->map(function ($clase) {
                    return [
                        'id' => $clase->id,
                        'nombre' => $clase->nombre,
                        'fecha' => $clase->fecha,
                        'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                        'hora_fin' => substr($clase->hora_fin, 0, 5),
                        'capacidad' => $clase->capacidad,
                        // Contar solo reservas no canceladas
                        'inscritos' => $clase->clientes()->wherePivot('estado', '!=', 'cancelado')->count(),
                    ];
                }),
            ],
        ]);
    }

    public function edit(User $entrenador)
    {
        $entrenador->load('horarioTrabajo');

        return Inertia::render('Entrenadores/Edit', [
            'entrenador' => [
                'id' => $entrenador->id,
                'name' => $entrenador->name,
                'email' => $entrenador->email,
            ],
            'horarioTrabajo' => $entrenador->horarioTrabajo->map(fn($h) => [
                'dia_semana' => (int) $h->dia_semana,
                'hora_inicio' => substr($h->hora_inicio, 0, 5),
                'hora_fin' => substr($h->hora_fin, 0, 5),
            ]),
        ]);
    }

    public function update(Request $request, User $entrenador)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', "unique:users,email,{$entrenador->id}"],
            'horarios' => ['nullable', 'array'],
            'horarios.*.dia_semana' => ['required', 'integer', 'between:0,6'],
            'horarios.*.hora_inicio' => ['required', 'date_format:H:i'],
            'horarios.*.hora_fin' => ['required', 'date_format:H:i', 'after:horarios.*.hora_inicio'],
        ]);

        // Validar que el total de horas no supere 40
        if (!empty($validated['horarios'])) {
            $totalHoras = 0;
            foreach ($validated['horarios'] as $horario) {
                $inicio = \Carbon\Carbon::createFromFormat('H:i', $horario['hora_inicio']);
                $fin = \Carbon\Carbon::createFromFormat('H:i', $horario['hora_fin']);
                $diferencia = $fin->diffInMinutes($inicio) / 60;
                $totalHoras += $diferencia;
            }
            if ($totalHoras > 40) {
                return redirect()
                    ->back()
                    ->withInput()
                    ->withErrors(['horarios' => "El total de horas no puede superar 40. Total actual: $totalHoras horas."]);
            }
        }

        $entrenador->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Borrar horarios previos y recrear
        HorarioTrabajo::where('user_id', $entrenador->id)->delete();

        if (!empty($validated['horarios'])) {
            foreach ($validated['horarios'] as $h) {
                HorarioTrabajo::create([
                    'user_id' => $entrenador->id,
                    'dia_semana' => $h['dia_semana'],
                    'hora_inicio' => $h['hora_inicio'],
                    'hora_fin' => $h['hora_fin'],
                ]);
            }
        }

        return redirect()->route('entrenadores.show', $entrenador)->with('success', 'Entrenador actualizado.');
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

        $clases = $user->horariosClases()
            ->with('clientes')
            ->get();

        return response()->json($clases);
    }
}
