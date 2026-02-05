<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\GuiaView;
use App\Models\GuiaAsignacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Guia;
use App\Models\GuiaProgreso;
use App\Models\ClaseAsistida;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class ClienteDashboardController extends Controller
{
    /**
     * Mostrar estadisticas del cliente autenticado
     */
    public function index()
    {
        $user = auth()->user();

        // Próximas clases (enviamos todas las reservadas, el frontend filtrará)
        $proximasClases = HorarioClase::with(['clase', 'entrenador', 'listaEspera'])
            ->where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '>=', now()->toDateString())
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get()
            ->map(function ($clase) {
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->clase ? $clase->clase->nombre : $clase->nombre,
                    'entrenador' => $clase->entrenador->name,
                    'fecha' => $clase->fecha->format('Y-m-d'),
                    'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                    'hora_fin' => substr($clase->hora_fin, 0, 5),
                    'dias_restantes' => now()->diffInDays($clase->fecha, false),
                ];
            });

        // Historial de clases (enviamos todas las pasadas, el frontend filtrará)
        $historialClases = HorarioClase::with(['clase', 'entrenador'])
            ->where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '<=', now()->toDateString())
            ->orderBy('fecha', 'desc')
            ->orderBy('hora_inicio', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($clase) {
                return [
                    'id' => $clase->id,
                    'nombre' => $clase->clase ? $clase->clase->nombre : $clase->nombre,
                    'entrenador' => $clase->entrenador->name,
                    'fecha' => $clase->fecha->format('Y-m-d'),
                    'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                    'hora_fin' => substr($clase->hora_fin, 0, 5),
                ];
            });

        // Guias semanales asignadas
        $guiaSemanalIds = GuiaAsignacion::where('user_id', $user->id)
            ->where('frecuencia', 'semanal')
            ->pluck('guia_id')
            ->toArray();

        $guiasSemanales = GuiaAsignacion::where('user_id', $user->id)
            ->where('frecuencia', 'semanal')
            ->with(['guia', 'guia.guiaEjercicio.ejercicio'])
            ->get()
            ->map(function ($asignacion) use ($user) {
                return $this->buildGuiaData($user, $asignacion->guia, $asignacion->created_at);
            })
            ->values();

        // Guía actual normal del cliente (excluir las semanales)
        $guiaActualView = GuiaView::where('user_id', $user->id)
            ->whereNotIn('guia_id', $guiaSemanalIds)
            ->with(['guia', 'guia.guiaEjercicio.ejercicio'])
            ->orderBy('created_at', 'asc')
            ->first();

        $guiaData = $guiaActualView
            ? $this->buildGuiaData($user, $guiaActualView->guia, $guiaActualView->created_at)
            : null;

        // Estadísticas del usuario
        // Contar clases asistidas: clases reservadas cuya hora_fin ya pasó
        $totalClasesTomadas = HorarioClase::where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where(function ($query) {
                $query->where('fecha', '<', now()->toDateString())
                    ->orWhere(function ($q) {
                        $q->where('fecha', '=', now()->toDateString())
                          ->where('hora_fin', '<=', now()->format('H:i:s'));
                    });
            })
            ->count();

        $totalClasesReservadas = HorarioClase::where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where(function ($query) {
                $query->where('fecha', '>', now()->toDateString())
                    ->orWhere(function ($q) {
                        $q->where('fecha', '=', now()->toDateString())
                          ->where('hora_fin', '>', now()->format('H:i:s'));
                    });
            })
            ->count();

        $enListaEspera = \App\Models\ListaEsperaClase::where('user_id', $user->id)->count();

        // Total de guías completadas por el usuario (incluyendo repeticiones)
        $totalGuiasCompletadas = \App\Models\GuiaCompletada::where('user_id', $user->id)->count();

        $imcCalculado = $user->imc;
        $latestMeasurement = $user->measurements()->orderBy('fecha_medicion', 'desc')->first();
        $pesoBase = $latestMeasurement->peso_kg ?? $user->peso_kg;
        $alturaBase = $latestMeasurement->altura_cm ?? $user->altura_cm;
        if ($pesoBase && $alturaBase) {
            $alturaM = $alturaBase / 100;
            if ($alturaM > 0) {
                $imcCalculado = round($pesoBase / ($alturaM * $alturaM), 1);
            }
        }

        $nivelCondicion = $this->nivelDesdeImc($imcCalculado);

        // Clases por mes (últimos 12 meses)
        $clasesPorMes = [];
        for ($i = 11; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $count = ClaseAsistida::where('user_id', $user->id)
                ->whereMonth('fecha', $mes->month)
                ->whereYear('fecha', $mes->year)
                ->count();

            $mesLabel = $mes->locale('es')->isoFormat('MMM');

            // Buscar medición más cercana del mes
            $measurement = $user->measurements()
                ->whereMonth('fecha_medicion', $mes->month)
                ->whereYear('fecha_medicion', $mes->year)
                ->orderBy('fecha_medicion', 'desc')
                ->first();

            $peso = $measurement?->peso_kg;
            $grasa = $measurement?->grasa_corporal_pct;
            $imc = null;
            if ($peso && $measurement?->altura_cm) {
                $alturaM = $measurement->altura_cm / 100;
                if ($alturaM > 0) {
                    $imc = round($peso / ($alturaM * $alturaM), 1);
                }
            }

            $clasesPorMes[] = [
                'mes' => ucfirst(rtrim($mesLabel, '.')),
                'cantidad' => $count,
                'peso_kg' => $peso,
                'grasa_corporal_pct' => $grasa,
                'imc' => $imc,
            ];
        }

        // Recomendaciones de guías según nivel
        $recomendacionesGuia = $this->obtenerGuiaRecomendada($nivelCondicion);

        return Inertia::render('Clientes/Estadisticas', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'telefono' => $user->telefono,
            ],
            'metricas' => [
                'peso_kg' => $user->peso_kg,
                'altura_cm' => $user->altura_cm,
                'grasa_corporal_pct' => $user->grasa_corporal_pct,
                'imc' => $imcCalculado,
            ],
            'proximasClases' => $proximasClases,
            'historialClases' => $historialClases,
            'guiaActual' => $guiaData,
            'guiasSemanales' => $guiasSemanales,
            'guiaRecomendadas' => $recomendacionesGuia,
            'nivelCondicion' => $nivelCondicion,
            'estadisticas' => [
                'total_clases_tomadas' => $totalClasesTomadas,
                'total_clases_reservadas' => $totalClasesReservadas,
                'en_lista_espera' => $enListaEspera,
                'total_guias_completadas' => $totalGuiasCompletadas,
            ],
            'clasesPorMes' => $clasesPorMes,
        ]);
    }

    public function updateMetrics(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'peso_kg' => 'nullable|numeric|min:1|max:500',
            'altura_cm' => 'nullable|numeric|min:50|max:260',
            'grasa_corporal_pct' => 'nullable|numeric|min:0|max:80',
        ]);

        $imc = null;
        if (!empty($validated['peso_kg']) && !empty($validated['altura_cm'])) {
            $alturaM = $validated['altura_cm'] / 100;
            if ($alturaM > 0) {
                $imc = round($validated['peso_kg'] / ($alturaM * $alturaM), 1);
            }
        }

        $user->update([
            'peso_kg' => $validated['peso_kg'] ?? null,
            'altura_cm' => $validated['altura_cm'] ?? null,
            'grasa_corporal_pct' => $validated['grasa_corporal_pct'] ?? null,
            'imc' => $imc,
        ]);

        return redirect()
            ->route('estadisticas')
            ->with('success', 'Medidas actualizadas correctamente.');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'telefono' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'telefono' => $validated['telefono'] ?? null,
        ]);

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()
            ->route('estadisticas')
            ->with('profile_success', 'Datos actualizados correctamente.');
    }

    private function nivelDesdeImc(?float $imc): string
    {
        if (!$imc) {
            return 'Sin datos';
        }
        if ($imc < 18.5) {
            return 'Bajo peso';
        }
        if ($imc < 25) {
            return 'Saludable';
        }
        if ($imc < 30) {
            return 'Sobrepeso';
        }
        return 'Obesidad';
    }

    private function obtenerGuiaRecomendada(string $nivelCondicion)
    {
        $preferencias = [];
        $nivelLower = strtolower($nivelCondicion);
        if (str_contains($nivelLower, 'bajo')) {
            $preferencias = ['Principiante', 'Inicial', 'Bajo impacto'];
        } elseif (str_contains($nivelLower, 'salud')) {
            $preferencias = ['Intermedio', 'General', 'Fuerza'];
        } elseif (str_contains($nivelLower, 'sobre')) {
            $preferencias = ['Intermedio', 'Pérdida de grasa', 'Cardio'];
        } elseif (str_contains($nivelLower, 'obes')) {
            $preferencias = ['Adaptado', 'Bajo impacto', 'Inicial'];
        }

        $recomendadas = collect();

        if (!empty($preferencias)) {
            $recomendadas = Guia::withCount('guiaEjercicio')
                ->whereIn('nivel', $preferencias)
                ->latest()
                ->take(2)
                ->get();
        }

        if ($recomendadas->count() < 2) {
            $faltan = 2 - $recomendadas->count();
            $recomendadas = $recomendadas->merge(
                Guia::withCount('guiaEjercicio')
                    ->whereNotIn('id', $recomendadas->pluck('id'))
                    ->latest()
                    ->take($faltan)
                    ->get()
            );
        }

        return $recomendadas->map(function ($guia) {
            return [
                'id' => $guia->id,
                'titulo' => $guia->titulo,
                'nivel' => $guia->nivel,
                'ejercicios_count' => $guia->guia_ejercicio_count ?? $guia->guiaEjercicio()->count(),
            ];
        });
    }

    private function buildGuiaData($user, $guia, $asignadaAt): array
    {
        $totalEjercicios = $guia->guiaEjercicio()->count();

        $completadosIds = GuiaProgreso::where('user_id', $user->id)
            ->where('guia_id', $guia->id)
            ->where('completado', true)
            ->pluck('guia_ejercicio_id')
            ->toArray();

        $siguiente = $guia->guiaEjercicio
            ->sortBy('orden')
            ->first(function ($item) use ($completadosIds) {
                return !in_array($item->id, $completadosIds, true);
            });

        $faltan = max(0, $totalEjercicios - count($completadosIds));

        $vecesCompletada = \App\Models\GuiaCompletada::where('user_id', $user->id)
            ->where('guia_id', $guia->id)
            ->count();

        return [
            'id' => $guia->id,
            'titulo' => $guia->titulo,
            'nivel' => $guia->nivel,
            'contenido' => $guia->contenido,
            'ejercicios_count' => $totalEjercicios,
            'ejercicios_faltan' => $faltan,
            'siguiente_ejercicio' => $siguiente?->ejercicio?->nombre,
            'veces_completada' => $vecesCompletada,
            'asignada_el' => optional($asignadaAt)->format('Y-m-d'),
        ];
    }
}
