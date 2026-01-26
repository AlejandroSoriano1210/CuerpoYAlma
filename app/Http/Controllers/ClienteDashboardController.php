<?php

namespace App\Http\Controllers;

use App\Models\HorarioClase;
use App\Models\GuiaView;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClienteDashboardController extends Controller
{
    /**
     * Mostrar dashboard del cliente autenticado
     */
    public function index()
    {
        $user = auth()->user();

        // Próximas clases (próximos 7 días)
        $proximasClases = HorarioClase::with(['clase', 'entrenador', 'listaEspera'])
            ->where(function ($query) use ($user) {
                $query->whereHas('clientes', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->where('estado', '!=', 'cancelado');
                });
            })
            ->whereBetween('fecha', [now()->startOfDay(), now()->addDays(7)->endOfDay()])
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->limit(5)
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

            $clasesPorMes[] = [
                'mes' => $mes->format('M'),
                'cantidad' => $count,
            ];
        }

        return Inertia::render('Cliente/Dashboard', [
            'proximasClases' => $proximasClases,
            'historialClases' => $historialClases,
            'guiaActual' => $guiaData,
            'estadisticas' => [
                'total_clases_tomadas' => $totalClasesTomadas,
                'total_clases_reservadas' => $totalClasesReservadas,
                'en_lista_espera' => $enListaEspera,
            ],
            'clasesPorMes' => $clasesPorMes,
        ]);
    }
}
