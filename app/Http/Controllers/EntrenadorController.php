<?php

namespace App\Http\Controllers;

use App\Models\HorarioTrabajo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EntrenadorController extends Controller
{
    private function allowedRolesForUser(User $user): array
    {
        if ($user->hasRole('superusuario')) {
            return ['entrenador', 'jefe_entrenadores', 'tecnico', 'jefe_tecnicos', 'limpieza', 'jefe_limpieza'];
        }

        if ($user->hasRole('jefe_entrenadores')) {
            return ['entrenador', 'jefe_entrenadores'];
        }

        if ($user->hasRole('jefe_tecnicos')) {
            return ['tecnico', 'jefe_tecnicos'];
        }

        if ($user->hasRole('jefe_limpieza')) {
            return ['limpieza', 'jefe_limpieza'];
        }

        return [];
    }

    private function canManageEmpleado(User $actor, User $empleado): bool
    {
        $allowedRoles = $this->allowedRolesForUser($actor);

        return !empty($allowedRoles) && $empleado->hasAnyRole($allowedRoles);
    }

    // Listar empleados (entrenadores, técnicos, limpieza)
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $rolFiltro = $request->query('rol', ''); // Filtro por rol
        $estadoFiltro = $request->query('estado', 'activos');

        $allowedRoles = $this->allowedRolesForUser($request->user());
        if (empty($allowedRoles)) {
            abort(403, 'No tienes permiso para ver empleados.');
        }

        // Obtener todos los usuarios con roles de empleados (excluyendo superusuario y cliente)
        // Si hay filtro de rol, usar solo ese rol, sino todos
        if (!empty($rolFiltro) && in_array($rolFiltro, $allowedRoles, true)) {
            $query = User::role($rolFiltro);
        } else {
            $query = User::role($allowedRoles);
        }

        if ($estadoFiltro === 'inactivos') {
            $query->onlyTrashed();
        } elseif ($estadoFiltro === 'todos') {
            $query->withTrashed();
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
                'esta_inactivo' => $user->deleted_at !== null,
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
            'estadoFiltro' => $estadoFiltro,
            'rolesDisponibles' => $allowedRoles,
        ]);
    }

    // Mostrar formulario crear
    public function create()
    {
        $allowedRoles = $this->allowedRolesForUser(request()->user());
        if (empty($allowedRoles)) {
            abort(403, 'No tienes permiso para crear empleados.');
        }

        return Inertia::render('Entrenadores/Create', [
            'rolesDisponibles' => $allowedRoles,
        ]);
    }

    public function store(Request $request)
    {
        $allowedRoles = $this->allowedRolesForUser($request->user());
        if (empty($allowedRoles)) {
            abort(403, 'No tienes permiso para crear empleados.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'password' => 'required|min:8|confirmed',
            'rol' => 'required|in:' . implode(',', $allowedRoles),
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
        if (!$this->canManageEmpleado(request()->user(), $entrenador)) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para ver este empleado.']);
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
        if ($entrenador->hasAnyRole(['entrenador', 'jefe_entrenadores'])) {
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
        if ($entrenador->hasAnyRole(['tecnico', 'jefe_tecnicos'])) {
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

            // Cargar los reportes de reparación realizados por este técnico
            $reportes = \App\Models\MaquinaReporte::where('tecnico_id', $entrenador->id)
                ->with('maquina')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($reporte) {
                    return [
                        'id' => $reporte->id,
                        'maquina_nombre' => $reporte->maquina->nombre ?? 'Máquina eliminada',
                        'maquina_id' => $reporte->maquina_id,
                        'estado_anterior' => $reporte->estado_anterior,
                        'tiempo_reparacion' => $reporte->tiempo_reparacion,
                        'unidad_tiempo' => $reporte->unidad_tiempo,
                        'coste_reparacion' => $reporte->coste_reparacion,
                        'notas' => $reporte->notas,
                        'created_at' => $reporte->created_at,
                    ];
                });
            $data['reportes'] = $reportes;
            $data['totalReportes'] = $reportes->count();
            $data['totalCosteReparaciones'] = $reportes->sum('coste_reparacion');
        }

        return Inertia::render('Entrenadores/Show', [
            'entrenador' => $data,
        ]);
    }

    public function edit(User $entrenador)
    {
        if (!$this->canManageEmpleado(request()->user(), $entrenador)) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para editar este empleado.']);
        }

        $entrenador->load('horarioTrabajo', 'roles');

        $allowedRoles = $this->allowedRolesForUser(request()->user());

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
            'rolesDisponibles' => $allowedRoles,
        ]);
    }

    public function update(Request $request, User $entrenador)
    {
        if (!$this->canManageEmpleado($request->user(), $entrenador)) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para editar este empleado.']);
        }

        $allowedRoles = $this->allowedRolesForUser($request->user());
        if (empty($allowedRoles)) {
            abort(403, 'No tienes permiso para editar empleados.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', "unique:users,email,{$entrenador->id}"],
            'telefono' => ['nullable', 'string', 'max:20'],
            'rol' => ['required', 'in:' . implode(',', $allowedRoles)],
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
        if (!$this->canManageEmpleado(request()->user(), $entrenador)) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para eliminar este empleado.']);
        }

        $entrenador->delete();

        return redirect()
            ->route('entrenadores.index')
            ->with('success', 'Empleado eliminado correctamente.');
    }

    public function restore($entrenadorId)
    {
        $entrenador = User::withTrashed()->findOrFail($entrenadorId);

        if (!$this->canManageEmpleado(request()->user(), $entrenador)) {
            return redirect()->back()->withErrors(['error' => 'No tienes permiso para reactivar este empleado.']);
        }

        $entrenador->restore();

        return redirect()
            ->route('entrenadores.index')
            ->with('success', 'Empleado reactivado correctamente.');
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
