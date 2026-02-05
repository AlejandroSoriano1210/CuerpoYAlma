import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BackLink } from '@/Components';

export default function ClientesShow({ cliente, mesActual, anoActual }) {
    const [paginaActual, setPaginaActual] = useState(1);
    const pagosPorPagina = 5;

    const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const cambiarFactura = (pagoId) => {
        router.get(
            route('clientes.show', cliente.id),
            { pago_id: pagoId },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Calcular pagos paginados
    const totalPaginas = Math.ceil((cliente.pagos?.length || 0) / pagosPorPagina);
    const indexInicio = (paginaActual - 1) * pagosPorPagina;
    const indexFin = indexInicio + pagosPorPagina;
    const pagosPaginados = cliente.pagos?.slice(indexInicio, indexFin) || [];

    const handleDelete = () => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${cliente.name}?`)) {
            router.delete(route('clientes.destroy', cliente.id), {
                onSuccess: () => {
                    // Redirige automáticamente
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Cliente: ${cliente.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <BackLink href={route('clientes.index')} text="Volver a Clientes" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Información Personal */}
                        <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{cliente.name}</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Nombre</label>
                                    <p className="text-gray-900 mt-1 font-medium">{cliente.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900 mt-1 font-medium">{cliente.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                                    <p className="text-gray-900 mt-1 font-medium">{cliente.telefono || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Fecha de Registro</label>
                                    <p className="text-gray-900 mt-1 font-medium">
                                        {new Date(cliente.created_at).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={handleDelete}
                                    className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Eliminar Cliente
                                </button>
                            </div>
                        </div>

                        {/* Clases Reservadas */}
                        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Clases Reservadas ({cliente.clasesReservadas?.length || 0})
                            </h2>

                            {cliente.clasesReservadas && cliente.clasesReservadas.length > 0 ? (
                                <div className="space-y-4">
                                    {cliente.clasesReservadas.map((clase) => (
                                        <div
                                            key={clase.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{clase.nombre}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Entrenador: <span className="font-medium">{clase.entrenador}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-600">📅 Fecha:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(clase.fecha).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">⏰ Horario:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {clase.hora_inicio} - {clase.hora_fin}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">
                                    <p className="text-lg">No tiene clases reservadas</p>
                                </div>
                            )}
                        </div>

                        {/* Factura */}
                        {cliente.pagoSeleccionado && (
                            <div className="lg:col-span-3 bg-white shadow-lg rounded-lg overflow-hidden border-2 border-green-200">
                                {/* Contenido de la Factura */}
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">FACTURA</h2>
                                            <p className="text-sm text-gray-600">
                                                Factura #{cliente.pagoSeleccionado.id.toString().padStart(6, '0')}
                                            </p>
                                        </div>
                                        <div className="text-right flex gap-3 items-center">
                                            <a
                                                href={route('clientes.descargarFactura', {
                                                    cliente: cliente.id,
                                                    pago: cliente.pagoSeleccionado.id
                                                })}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Descargar PDF
                                            </a>
                                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                                                PAGADO
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6 mb-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Información del Cliente */}
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                                    Facturado a:
                                                </h3>
                                                <div className="space-y-2">
                                                    <p className="text-gray-900 font-bold text-lg">{cliente.name}</p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Email:</span> {cliente.email}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Teléfono:</span> {cliente.telefono || 'No especificado'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Información del Pago */}
                                            <div className="text-right">
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                                                    Detalles del Pago:
                                                </h3>
                                                <div className="space-y-2">
                                                    <p className="text-gray-900 font-bold text-lg">
                                                        {mesesNombres[cliente.pagoSeleccionado.mes - 1]} {cliente.pagoSeleccionado.ano}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <span className="font-medium">Fecha de pago:</span>
                                                    </p>
                                                    <p className="text-gray-900">
                                                        {new Date(cliente.pagoSeleccionado.created_at).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabla de Concepto */}
                                    <div className="border-t border-gray-200 pt-6 mb-6">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                        Concepto
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                        Cantidad
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                        Precio
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-gray-200">
                                                    <td className="px-4 py-4 text-gray-900">
                                                        Membresía Mensual - {mesesNombres[cliente.pagoSeleccionado.mes - 1]} {cliente.pagoSeleccionado.ano}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-gray-900">1</td>
                                                    <td className="px-4 py-4 text-right text-gray-900">
                                                        ${cliente.pagoSeleccionado.monto.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-bold text-gray-900">
                                                        ${cliente.pagoSeleccionado.monto.toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Total */}
                                    <div className="border-t-2 border-gray-300 pt-4">
                                        <div className="flex justify-end">
                                            <div className="w-64">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span className="text-gray-900">
                                                        ${cliente.pagoSeleccionado.monto.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                                    <span className="text-lg font-bold text-gray-900">Total:</span>
                                                    <span className="text-lg font-bold text-green-600">
                                                        ${cliente.pagoSeleccionado.monto.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 text-center">
                                            Gracias por tu confianza en Cuerpo & Alma
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Historial de Pagos */}
                        <div className="lg:col-span-3 bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Historial de Pagos ({cliente.pagos?.length || 0})
                            </h2>
                            {cliente.pagos && cliente.pagos.length > 1 && (
                                <p className="text-sm text-gray-600 mb-4">
                                    Haz clic en un pago para ver su factura
                                </p>
                            )}

                            {cliente.pagos && cliente.pagos.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Período</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha de Registro</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notas</th>
                                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {pagosPaginados.map((pago) => (
                                                    <tr
                                                        key={pago.id}
                                                        onClick={() => cambiarFactura(pago.id)}
                                                        className={`cursor-pointer transition-colors ${cliente.pagoSeleccionado?.id === pago.id
                                                                ? 'bg-green-50 border-l-4 border-green-500'
                                                                : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                            <div className="flex items-center gap-2">
                                                                {cliente.pagoSeleccionado?.id === pago.id && (
                                                                    <span className="text-green-600 font-bold">→</span>
                                                                )}
                                                                {mesesNombres[pago.mes - 1]} {pago.ano}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(pago.created_at).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {pago.notas || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                                                ✓ Pagado
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Controles de Paginación */}
                                    {totalPaginas > 1 && (
                                        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                                            <div className="text-sm text-gray-700">
                                                Mostrando {indexInicio + 1} a {Math.min(indexFin, cliente.pagos.length)} de {cliente.pagos.length} pagos
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setPaginaActual(paginaActual - 1)}
                                                    disabled={paginaActual === 1}
                                                    className={`px-3 py-1 rounded border ${paginaActual === 1
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                        }`}
                                                >
                                                    Anterior
                                                </button>

                                                {[...Array(totalPaginas)].map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setPaginaActual(index + 1)}
                                                        className={`px-3 py-1 rounded border ${paginaActual === index + 1
                                                                ? 'bg-green-600 text-white border-green-600'
                                                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => setPaginaActual(paginaActual + 1)}
                                                    disabled={paginaActual === totalPaginas}
                                                    className={`px-3 py-1 rounded border ${paginaActual === totalPaginas
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                        }`}
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">
                                    <p className="text-lg">No hay pagos registrados</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
