<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pago;
use App\Models\UserMeasurement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index()
    {
        $search = $request->query('search', '');
        $estadoFiltro = $request->query('estado', 'activos');

        // Obtener mes y año actual
        $mesActual = now()->month;
        $anoActual = now()->year;

        $query = User::role('cliente')
            ->select(
                'users.*',
                DB::raw("CASE
                    WHEN ultimo_pago_ano = {$anoActual} AND ultimo_pago_mes = {$mesActual} THEN true
                    ELSE false
                END as ha_pagado_mes_actual")
            );

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

        $clientes = $query->get()->map(function ($cliente) {
            $cliente->esta_inactivo = $cliente->deleted_at !== null;
            return $cliente;
        });

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'search' => $search,
            'mesActual' => $mesActual,
            'anoActual' => $anoActual,
            'estadoFiltro' => $estadoFiltro,
        ]);
    }

    public function create()
    {
        return Inertia::render('Clientes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            $user->assignRole('cliente');

            return redirect()
                ->route('clientes.index')
                ->with('success', 'Cliente creado correctamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al crear el cliente.']);
        }
    }

    public function show(Request $request, $clienteId)
    {
        $cliente = User::withTrashed()->findOrFail($clienteId);

        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $cliente->load(['clasesReservadas.entrenador', 'pagos']);

        // Obtener pago seleccionado o el del mes actual por defecto
        $pagoIdSeleccionado = $request->query('pago_id');
        $mesActual = now()->month;
        $anoActual = now()->year;

        // Ordenar pagos por año y mes descendente (más reciente primero)
        $pagosOrdenados = $cliente->pagos()
            ->orderBy('ano', 'desc')
            ->orderBy('mes', 'desc')
            ->get();

        // Determinar qué pago mostrar en la factura
        if ($pagoIdSeleccionado) {
            $pagoSeleccionado = $cliente->pagos()->find($pagoIdSeleccionado);
        } else {
            // Por defecto, mostrar el pago del mes actual o el más reciente
            $pagoSeleccionado = $cliente->pagos()
                ->where('mes', $mesActual)
                ->where('ano', $anoActual)
                ->first() ?? $pagosOrdenados->first();
        }

        return Inertia::render('Clientes/Show', [
            'cliente' => [
                'id' => $cliente->id,
                'name' => $cliente->name,
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
                'created_at' => $cliente->created_at,
                'updated_at' => $cliente->updated_at,
                'clasesReservadas' => $cliente->clasesReservadas->map(function ($clase) {
                    return [
                        'id' => $clase->id,
                        'nombre' => $clase->nombre,
                        'entrenador' => $clase->entrenador->name,
                        'fecha' => $clase->fecha->format('Y-m-d'),
                        'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                        'hora_fin' => substr($clase->hora_fin, 0, 5),
                    ];
                }),
                'pagos' => $pagosOrdenados->map(function ($pago) {
                    return [
                        'id' => $pago->id,
                        'mes' => $pago->mes,
                        'ano' => $pago->ano,
                        'monto' => (float) ($pago->monto ?? 10.00),
                        'notas' => $pago->notas,
                        'created_at' => $pago->created_at->format('Y-m-d H:i:s'),
                    ];
                }),
                'pagoSeleccionado' => $pagoSeleccionado ? [
                    'id' => $pagoSeleccionado->id,
                    'mes' => $pagoSeleccionado->mes,
                    'ano' => $pagoSeleccionado->ano,
                    'monto' => (float) ($pagoSeleccionado->monto ?? 10.00),
                    'created_at' => $pagoSeleccionado->created_at->format('Y-m-d H:i:s'),
                ] : null,
            ],
            'mesActual' => $mesActual,
            'anoActual' => $anoActual,
        ]);
    }

    public function edit(User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        return Inertia::render('Clientes/Edit', [
            'cliente' => [
                'id' => $cliente->id,
                'name' => $cliente->name,
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
            ],
        ]);
    }

    public function update(Request $request, User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $cliente->id,
            'telefono' => 'nullable|string|max:50',
        ]);

        $cliente->update($validated);

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente actualizado correctamente.');
    }

    public function destroy(User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $cliente->delete();

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente eliminado correctamente.');
    }

    public function restore($clienteId)
    {
        $cliente = User::withTrashed()->findOrFail($clienteId);

        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $cliente->restore();

        return redirect()
            ->route('clientes.index')
            ->with('success', 'Cliente reactivado correctamente.');
    }

    public function marcarPagos(Request $request)
    {
        $validated = $request->validate([
            'cliente_ids' => 'required|array',
            'cliente_ids.*' => 'exists:users,id',
        ]);

        $mesActual = now()->month;
        $anoActual = now()->year;

        try {
            DB::beginTransaction();

            foreach ($validated['cliente_ids'] as $clienteId) {
                // Actualizar último pago en el usuario
                User::where('id', $clienteId)
                    ->update([
                        'ultimo_pago_mes' => $mesActual,
                        'ultimo_pago_ano' => $anoActual,
                    ]);

                // Crear o actualizar registro de pago
                Pago::updateOrCreate(
                    [
                        'user_id' => $clienteId,
                        'mes' => $mesActual,
                        'ano' => $anoActual,
                    ],
                    [
                        'monto' => null, // Se puede modificar después si se desea
                        'notas' => 'Pago registrado el ' . now()->format('d/m/Y'),
                    ]
                );
            }

            DB::commit();

            $cantidad = count($validated['cliente_ids']);
            $mensaje = $cantidad === 1
                ? 'Pago registrado correctamente.'
                : "{$cantidad} pagos registrados correctamente.";

            return redirect()
                ->route('clientes.index')
                ->with('success', $mensaje);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()
                ->back()
                ->withErrors(['error' => 'Error al registrar los pagos.']);
        }
    }

    public function descargarFactura(User $cliente, Pago $pago)
    {
        // Verificar que el pago pertenece al cliente
        if ($pago->user_id !== $cliente->id) {
            return redirect()->back()->withErrors(['error' => 'Factura no encontrada.']);
        }

        $mesesNombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        $mesNombre = $mesesNombres[$pago->mes - 1];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.factura', [
            'cliente' => $cliente,
            'pago' => $pago,
            'mesNombre' => $mesNombre,
        ]);

        $filename = 'factura-' . \Illuminate\Support\Str::slug($cliente->name) . '-' . $pago->mes . '-' . $pago->ano . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Agregar una nueva medición a un cliente
     */
    public function agregarMedicion(Request $request)
    {
        $cliente = $cliente ?? $request->user();

        if (!$cliente) {
            return redirect()->back()->withErrors(['error' => 'Cliente no encontrado.']);
        }

        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $validated = $request->validate([
            'peso_kg' => 'nullable|numeric|min:1|max:500',
            'altura_cm' => 'nullable|numeric|min:50|max:260',
            'grasa_corporal_pct' => 'nullable|numeric|min:0|max:80',
            'fecha_medicion' => 'required|date',
        ]);

        // Crear la medición
        $measurement = $cliente->measurements()->create([
            'peso_kg' => $validated['peso_kg'] ?? null,
            'altura_cm' => $validated['altura_cm'] ?? null,
            'grasa_corporal_pct' => $validated['grasa_corporal_pct'] ?? null,
            'fecha_medicion' => $validated['fecha_medicion'],
        ]);

        // Actualizar datos principales del usuario
        $pesoBase = $measurement->peso_kg ?? $cliente->peso_kg;
        $alturaBase = $measurement->altura_cm ?? $cliente->altura_cm;
        $imc = null;

        if ($pesoBase && $alturaBase) {
            $alturaM = $alturaBase / 100;
            if ($alturaM > 0) {
                $imc = round($pesoBase / ($alturaM * $alturaM), 1);
            }
        }

        $cliente->update([
            'peso_kg' => $measurement->peso_kg ?? $cliente->peso_kg,
            'altura_cm' => $measurement->altura_cm ?? $cliente->altura_cm,
            'grasa_corporal_pct' => $measurement->grasa_corporal_pct ?? $cliente->grasa_corporal_pct,
            'imc' => $imc ?? $cliente->imc,
        ]);

        return redirect()
            ->back()
            ->with('success', 'Medición registrada correctamente.');
    }

    /**
     * Mostrar estadísticas y mediciones de un cliente
     */
    public function estadisticas(User $cliente)
    {
        if (!$cliente->hasRole('cliente')) {
            return redirect()->back()->withErrors(['error' => 'Este usuario no es un cliente.']);
        }

        $cliente->load('measurements');
        $mediciones = $cliente->medicionesUltimos30Dias();

        return Inertia::render('Clientes/Estadisticas', [
            'cliente' => [
                'id' => $cliente->id,
                'name' => $cliente->name,
                'email' => $cliente->email,
                'peso_kg' => $cliente->peso_kg,
                'altura_cm' => $cliente->altura_cm,
                'grasa_corporal_pct' => $cliente->grasa_corporal_pct,
                'imc' => $cliente->imc,
            ],
            'mediciones' => $mediciones->map(function ($medicion) {
                return [
                    'id' => $medicion->id,
                    'peso_kg' => $medicion->peso_kg,
                    'altura_cm' => $medicion->altura_cm,
                    'grasa_corporal_pct' => $medicion->grasa_corporal_pct,
                    'fecha_medicion' => $medicion->fecha_medicion->format('Y-m-d'),
                ];
            }),
        ]);
    }
}
