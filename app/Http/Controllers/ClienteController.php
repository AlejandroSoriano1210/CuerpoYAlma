<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');

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

        if (!empty($search)) {
            $operator = DB::connection()->getDriverName() === 'pgsql' ? 'ILIKE' : 'LIKE';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('name', $operator, "%{$search}%")
                  ->orWhere('email', $operator, "%{$search}%");
            });
        }

        $clientes = $query->get();

        return Inertia::render('Clientes/Index', [
            'clientes' => $clientes,
            'search' => $search,
            'mesActual' => $mesActual,
            'anoActual' => $anoActual,
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

    public function show(Request $request, User $cliente)
    {
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
}
