<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\GuiaView;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Guia;

class ClienteDashboardController extends Controller
{
    /**
     * Mostrar dashboard del cliente autenticado
     */
    public function index()
    {
        $user = auth()->user();

        // Próximas clases (todas las futuras)
        $proximasClases = HorarioClase::with(['clase', 'entrenador', 'listaEspera'])
            ->where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '>=', now()->startOfDay())
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

        // Historial de clases (últimas 10 clases tomadas)
        $historialClases = HorarioClase::with(['clase', 'entrenador'])
            ->where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '<', now())
            ->orderBy('fecha', 'desc')
            ->limit(10)
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

        // Guía actual del cliente
        $guiaActual = GuiaView::where('user_id', $user->id)
            ->with(['guia', 'guia.guiaEjercicio'])
            ->first();

        $guiaData = null;
        if ($guiaActual) {
            $guia = $guiaActual->guia;
            $guiaData = [
                'id' => $guia->id,
                'titulo' => $guia->titulo,
                'nivel' => $guia->nivel,
                'contenido' => $guia->contenido,
                'ejercicios_count' => $guia->guiaEjercicio()->count(),
                'asignada_el' => $guiaActual->created_at->format('Y-m-d'),
            ];
        }

        // Estadísticas del usuario
        $totalClasesTomadas = HorarioClase::where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '<', now())
            ->count();

        $totalClasesReservadas = HorarioClase::where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->where('fecha', '>=', now())
            ->count();

        $enListaEspera = \App\Models\ListaEsperaClase::where('user_id', $user->id)->count();

        $imcCalculado = $user->imc;
        $latestMeasurement = $user->measurements()->orderBy('fecha_medicion', 'desc')->first();
        $pesoBase = $latestMeasurement->peso_kg ?? $user->peso_kg;
        $alturaBase = $latestMeasurement->altura_cm ?? $user->altura_cm;
        if (!$imcCalculado && $pesoBase && $alturaBase) {
            $alturaM = $alturaBase / 100;
            if ($alturaM > 0) {
                $imcCalculado = round($pesoBase / ($alturaM * $alturaM), 1);
            }
        }

        $nivelCondicion = $this->nivelDesdeImc($imcCalculado);

        // Clases por mes (últimos 6 meses)
        $clasesPorMes = [];
        for ($i = 5; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $count = HorarioClase::where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->whereMonth('fecha', $mes->month)
            ->whereYear('fecha', $mes->year)
            ->where('fecha', '<', now())
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
            'guiaRecomendadas' => $recomendacionesGuia,
            'nivelCondicion' => $nivelCondicion,
            'estadisticas' => [
                'total_clases_tomadas' => $totalClasesTomadas,
                'total_clases_reservadas' => $totalClasesReservadas,
                'en_lista_espera' => $enListaEspera,
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
}
