import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SearchBar from '@/Components/SearchBar';
import { usaRoleUser } from '@/Hooks/usaRoleUser';

export default function ClientesIndex({ clientes, search: initialSearch, mesActual, anoActual }) {
    const { flash } = usePage().props;
    const { hasRole } = usaRoleUser();
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [clientesSeleccionados, setClientesSeleccionados] = useState([]);

    const esSuperusuario = hasRole('superusuario');

    const toggleModoSeleccion = () => {
        setModoSeleccion(!modoSeleccion);
        setClientesSeleccionados([]);
    };

    const toggleCliente = (clienteId) => {
        setClientesSeleccionados(prev =>
            prev.includes(clienteId)
                ? prev.filter(id => id !== clienteId)
                : [...prev, clienteId]
        );
    };

    const marcarPagos = () => {
        if (clientesSeleccionados.length === 0) {
            alert('Selecciona al menos un cliente');
            return;
        }

        const cantidad = clientesSeleccionados.length;
        const mensaje = cantidad === 1
            ? '¿Marcar este cliente como pagado?'
            : `¿Marcar ${cantidad} clientes como pagados?`;

        if (confirm(mensaje)) {
            router.post(route('clientes.marcarPagos'), {
                cliente_ids: clientesSeleccionados
            }, {
                onSuccess: () => {
                    setModoSeleccion(false);
                    setClientesSeleccionados([]);
                },
            });
        }
    };

    const handleDelete = (id, name) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
            router.delete(route('clientes.destroy', id), {
                onSuccess: () => {
                    // El mensaje flash se muestra automáticamente
                },
            });
        }
    };

    const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Clientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                        {esSuperusuario && (
                            <div className="flex gap-3">
                                {modoSeleccion && (
                                    <button
                                        onClick={marcarPagos}
                                        disabled={clientesSeleccionados.length === 0}
                                        className={`font-semibold py-2 px-4 rounded ${
                                            clientesSeleccionados.length === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                    >
                                        Marcar Pagos ({clientesSeleccionados.length})
                                    </button>
                                )}
                                <button
                                    onClick={toggleModoSeleccion}
                                    className={`font-semibold py-2 px-4 rounded ${
                                        modoSeleccion
                                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                >
                                    {modoSeleccion ? 'Cancelar' : 'Registrar Pagos'}
                                </button>
                            </div>
                        )}
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    {/* Barra de búsqueda */}
                    <div className="mb-6">
                        <SearchBar initialSearch={initialSearch} routeName="clientes.index" />
                    </div>

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {clientes.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-200">
                                    <tr>
                                        {modoSeleccion && esSuperusuario && (
                                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                                                Seleccionar
                                            </th>
                                        )}
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                            Estado de Pago ({mesesNombres[mesActual - 1]} {anoActual})
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fecha Registro</th>
                                        {!modoSeleccion && (
                                            <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id} className="hover:bg-gray-50">
                                            {modoSeleccion && esSuperusuario && (
                                                <td className="px-6 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={clientesSeleccionados.includes(cliente.id)}
                                                        onChange={() => toggleCliente(cliente.id)}
                                                        className="w-5 h-5 text-blue-600 cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {cliente.ha_pagado_mes_actual ? (
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                                        ✓ Pagado
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                                                        ✗ Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(cliente.created_at).toLocaleDateString('es-ES')}
                                            </td>
                                            {!modoSeleccion && (
                                                <td className="px-6 py-4 text-center space-x-2">
                                                    <Link
                                                        href={route('clientes.show', cliente.id)}
                                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                                    >
                                                        Ver
                                                    </Link>

                                                    <Link
                                                        href={route('clientes.edit', cliente.id)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Editar
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(cliente.id, cliente.name)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p className="text-lg">
                                    {initialSearch ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

