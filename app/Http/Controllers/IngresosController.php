<?php

namespace App\Http\Controllers;

use App\Models\MaquinaReporte;
use App\Models\Pago;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IngresosController extends Controller
{
    public function index(Request $request)
    {
        $mes = (int) $request->query('mes', now()->month);
        $ano = (int) $request->query('ano', now()->year);
        $ivaRate = 0.21;

        $pagos = Pago::with(['user' => function ($query) {
                $query->withTrashed()->select('id', 'name', 'email');
            }])
            ->where('mes', $mes)
            ->where('ano', $ano)
            ->orderBy('created_at', 'desc')
            ->get();

        $subtotal = (float) $pagos->sum(function ($pago) {
            return $pago->monto ?? 10.00;
        });

        $ivaAmount = $subtotal * $ivaRate;
        $totalConIva = $subtotal + $ivaAmount;

        $reportes = MaquinaReporte::query()
            ->with(['maquina:id,nombre', 'tecnico:id,name'])
            ->whereYear('created_at', $ano)
            ->whereMonth('created_at', $mes)
            ->orderBy('created_at', 'desc')
            ->get();

        $reparaciones = (float) $reportes->sum('coste_reparacion');

        $neto = $totalConIva - $reparaciones;

        $anoActual = now()->year;
        $anos = range($anoActual - 3, $anoActual + 1);

        return Inertia::render('Ingresos/Index', [
            'mes' => $mes,
            'ano' => $ano,
            'anos' => $anos,
            'ivaRate' => $ivaRate,
            'resumen' => [
                'subtotal' => $subtotal,
                'iva' => $ivaAmount,
                'totalConIva' => $totalConIva,
                'reparaciones' => $reparaciones,
                'neto' => $neto,
            ],
            'pagos' => $pagos->map(function ($pago) {
                return [
                    'id' => $pago->id,
                    'cliente_id' => $pago->user_id,
                    'cliente' => $pago->user?->name,
                    'email' => $pago->user?->email,
                    'mes' => $pago->mes,
                    'ano' => $pago->ano,
                    'monto' => (float) ($pago->monto ?? 10.00),
                    'created_at' => $pago->created_at->format('Y-m-d H:i:s'),
                ];
            }),
            'reportes' => $reportes->map(function ($reporte) {
                return [
                    'id' => $reporte->id,
                    'maquina' => $reporte->maquina?->nombre ?? 'Maquina eliminada',
                    'tecnico' => $reporte->tecnico?->name ?? 'No asignado',
                    'estado_anterior' => $reporte->estado_anterior,
                    'tiempo_reparacion' => $reporte->tiempo_reparacion,
                    'unidad_tiempo' => $reporte->unidad_tiempo,
                    'coste_reparacion' => (float) $reporte->coste_reparacion,
                    'notas' => $reporte->notas,
                    'created_at' => $reporte->created_at->format('Y-m-d H:i:s'),
                ];
            }),
        ]);
    }
}
