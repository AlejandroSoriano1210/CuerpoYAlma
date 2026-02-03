<?php

namespace App\Http\Controllers;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EntrenadorController extends Controller
{
    // Listar empleados (entrenadores, técnicos, limpieza)
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $rolFiltro = $request->query('rol', ''); // Filtro por rol

        // Obtener todos los usuarios con roles de empleados (excluyendo superusuario y cliente)
        // Si hay filtro de rol, usar solo ese rol, sino todos
        if (!empty($rolFiltro) && in_array($rolFiltro, ['entrenador', 'tecnico', 'limpieza'])) {
            $query = User::role($rolFiltro);
        } else {
            $query = User::role(['entrenador', 'tecnico', 'limpieza']);
        }

        if (!empty($search)) {
            $operator = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('name', $operator, "%{$search}%")
                  ->orWhere('email', $operator, "%{$search}%");
            });
        }

        // Cargar los roles y horarios de cada empleado
        $entrenadores = $query->with(['roles', 'horarioTrabajo'])->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'rol' => $user->roles->first()->name ?? 'sin rol',
                'estado_empleado' => $user->estado_empleado ?? 'disponible',
                'horario_trabajo' => $user->horarioTrabajo->map(function ($h) {
                    return [
                        'dia_semana' => (int) $h->dia_semana,
                        'hora_inicio' => substr($h->hora_inicio, 0, 5),
                        'hora_fin' => substr($h->hora_fin, 0, 5),
                    ];
                }),
            ];
        });

        return Inertia::render('Entrenadores/Index', [
            'entrenadores' => $entrenadores,
            'search' => $search,
            'rolFiltro' => $rolFiltro,
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
            'telefono' => 'nullable|string|max:20',
            'password' => 'required|min:8|confirmed',
            'rol' => 'required|in:entrenador,tecnico,limpieza',
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
                'telefono' => $validated['telefono'] ?? null,
                'password' => bcrypt($validated['password']),
            ]);

            $user->assignRole($validated['rol']);

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
                ->with('success', 'Empleado creado correctamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al crear el entrenador.']);
        }
    }

    public function show(User $entrenador)
    {
        // Verificar que sea un empleado (no superusuario ni cliente)
        if (!$entrenador->hasAnyRole(['entrenador', 'tecnico', 'limpieza'])) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un empleado.']);
        }

        $entrenador->load('horarioTrabajo', 'roles');

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

        $data = [
            'id' => $entrenador->id,
            'name' => $entrenador->name,
            'email' => $entrenador->email,
            'telefono' => $entrenador->telefono,
            'rol' => $entrenador->roles->first()->name ?? 'sin rol',
            'created_at' => $entrenador->created_at,
            'updated_at' => $entrenador->updated_at,
            'horarioTrabajo' => $horariosPorDia,
        ];

        // Si es entrenador, cargar las clases que imparte
        if ($entrenador->hasRole('entrenador')) {
            $entrenador->load(['horariosClases' => function ($query) {
                $query->orderBy('fecha', 'asc')->orderBy('hora_inicio', 'asc');
            }]);
            $data['clasesCreadas'] = $entrenador->horariosClases->map(function ($clase) {
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->nombre,
                    'fecha' => $clase->fecha,
                    'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                    'hora_fin' => substr($clase->hora_fin, 0, 5),
                    'capacidad' => $clase->capacidad,
                    'inscritos' => $clase->clientes()->wherePivot('estado', '!=', 'cancelado')->count(),
                ];
            });

            // Contar clases impartidas este año
            $anoActual = now()->year;
            $data['clasesEsteAno'] = $entrenador->horariosClases()
                ->whereYear('fecha', $anoActual)
                ->count();
        }

        // Si es técnico, cargar las máquinas en mantenimiento o fuera de servicio
        if ($entrenador->hasRole('tecnico')) {
            $maquinasMantenimiento = \App\Models\Maquina::whereIn('estado', ['mantenimiento', 'fuera_de_servicio'])
                ->get()
                ->map(function ($maquina) {
                    return [
                        'id' => $maquina->id,
                        'nombre' => $maquina->nombre,
                        'descripcion' => $maquina->descripcion,
                        'estado' => $maquina->estado,
                        'ubicacion' => $maquina->ubicacion,
                    ];
                });
            $data['maquinasMantenimiento'] = $maquinasMantenimiento;
        }

        return Inertia::render('Entrenadores/Show', [
            'entrenador' => $data,
        ]);
    }

    public function edit(User $entrenador)
    {
        $entrenador->load('horarioTrabajo', 'roles');

        return Inertia::render('Entrenadores/Edit', [
            'entrenador' => [
                'id' => $entrenador->id,
                'name' => $entrenador->name,
                'email' => $entrenador->email,
                'telefono' => $entrenador->telefono,
                'rol' => $entrenador->roles->first()->name ?? 'entrenador',
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
            'telefono' => ['nullable', 'string', 'max:20'],
            'rol' => ['required', 'in:entrenador,tecnico,limpieza'],
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
            'telefono' => $validated['telefono'] ?? null,
        ]);

        // Actualizar el rol
        $entrenador->syncRoles([$validated['rol']]);

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

        return redirect()->route('entrenadores.show', $entrenador)->with('success', 'Empleado actualizado.');
    }

    public function destroy(User $entrenador)
    {
        // Verificar que sea un empleado (no superusuario ni cliente)
        if (!$entrenador->hasAnyRole(['entrenador', 'tecnico', 'limpieza'])) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un empleado.']);
        }

        $entrenador->delete();

        return redirect()
            ->route('entrenadores.index')
            ->with('success', 'Empleado eliminado correctamente.');
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
