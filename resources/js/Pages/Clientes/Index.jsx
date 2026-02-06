import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import { SearchBar, PageHeader, FlashMessage, EmptyState } from '@/Components';
import { Users, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export default function ClientesIndex({ clientes, search: initialSearch, mesActual, anoActual, estadoFiltro: initialEstadoFiltro }) {
    const { hasRole } = usaRoleUser();
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
    const [estadoFiltro, setEstadoFiltro] = useState(initialEstadoFiltro || 'activos');

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

    const handleRestore = (id, name) => {
        if (confirm(`¿Reactivar la cuenta de ${name}?`)) {
            router.patch(route('clientes.restore', id), {
                onSuccess: () => {
                    // El mensaje flash se muestra automáticamente
                },
            });
        }
    };

    const handleFiltroEstado = (nuevoEstado) => {
        setEstadoFiltro(nuevoEstado);
        const params = {};
        if (initialSearch) params.search = initialSearch;
        if (nuevoEstado) params.estado = nuevoEstado;

        router.get(route('clientes.index'), params, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const mesesNombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Clientes" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header con componente reutilizable */}
                    <PageHeader
                        title="Clientes"
                        description="Gestiona el registro y pagos de los clientes del gimnasio"
                        icon={<Users size={36} />}
                    />

                    {/* Flash messages con componente reutilizable */}
                    <FlashMessage />

                    {/* Barra de búsqueda y acciones */}
                    <div className="mb-6">
                        <SearchBar
                            initialSearch={initialSearch}
                            routeName="clientes.index"
                            extraParams={{ estado: estadoFiltro }}
                        />
                    </div>

                    {/* Filtro de estado */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="text-sm font-medium text-gray-700">
                                Estado:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleFiltroEstado('activos')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        estadoFiltro === 'activos'
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Activos
                                </button>
                                <button
                                    onClick={() => handleFiltroEstado('inactivos')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        estadoFiltro === 'inactivos'
                                            ? 'bg-red-700 text-white'
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                >
                                    Inactivos
                                </button>
                                <button
                                    onClick={() => handleFiltroEstado('todos')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        estadoFiltro === 'todos'
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}
                                >
                                    Todos
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Controles */}
                    {esSuperusuario && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CreditCard size={20} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Gestión de Pagos - {mesesNombres[mesActual - 1]} {anoActual}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                {modoSeleccion && (
                                    <button
                                        onClick={marcarPagos}
                                        disabled={clientesSeleccionados.length === 0}
                                        className={`font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2 ${clientesSeleccionados.length === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                    >
                                        ✓ Marcar Pagos ({clientesSeleccionados.length})
                                    </button>
                                )}
                                <button
                                    onClick={toggleModoSeleccion}
                                    className={`font-semibold py-2 px-4 rounded-lg transition ${modoSeleccion
                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    {modoSeleccion ? '✕ Cancelar' : '🔄 Registrar Pagos'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Clientes Grid o Tabla */}
                    <div>
                        {clientes.length > 0 ? (
                            modoSeleccion ? (
                                // Grid view for selection mode
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {clientes.map((cliente) => (
                                        <div
                                            key={cliente.id}
                                            onClick={() => toggleCliente(cliente.id)}
                                            className={`rounded-xl shadow-sm border-2 p-6 cursor-pointer transition relative ${clientesSeleccionados.includes(cliente.id)
                                                    ? 'bg-blue-50 border-blue-600'
                                                    : cliente.ha_pagado_mes_actual
                                                        ? 'bg-green-50 border-green-200 hover:border-green-400'
                                                        : 'bg-red-50 border-red-200 hover:border-red-400'
                                                }`}
                                        >
                                            {/* Status Bar */}
                                            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${clientesSeleccionados.includes(cliente.id)
                                                    ? 'bg-blue-500'
                                                    : cliente.ha_pagado_mes_actual
                                                        ? 'bg-green-500'
                                                        : 'bg-red-500'
                                                }`}></div>

                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900">{cliente.name}</h3>
                                                    <p className="text-sm text-gray-600">{cliente.email}</p>
                                                    {cliente.esta_inactivo && (
                                                        <span className="inline-block mt-2 text-xs font-bold bg-red-200 text-red-900 px-2 py-1 rounded-full">
                                                            INACTIVO
                                                        </span>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={clientesSeleccionados.includes(cliente.id)}
                                                    onChange={() => { }}
                                                    className="w-5 h-5 text-blue-600 rounded flex-shrink-0"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <span className="text-xs text-gray-600">{new Date(cliente.created_at).toLocaleDateString('es-ES')}</span>
                                                {cliente.ha_pagado_mes_actual ? (
                                                    <div className="flex items-center gap-1 bg-green-200 text-green-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        <CheckCircle size={14} />
                                                        PAGADO
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 bg-red-200 text-red-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        <AlertCircle size={14} />
                                                        PENDIENTE
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Grid view for normal mode
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {clientes.map((cliente) => (
                                        <div key={cliente.id} className={`rounded-xl shadow-sm hover:shadow-lg transition border-2 p-6 flex flex-col relative ${cliente.ha_pagado_mes_actual
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                            }`}>
                                            {/* Status Bar */}
                                            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${cliente.ha_pagado_mes_actual ? 'bg-green-500' : 'bg-red-500'
                                                }`}></div>

                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg text-gray-900 mb-1">{cliente.name}</h3>
                                                <p className="text-sm text-gray-600">{cliente.email}</p>
                                                {cliente.esta_inactivo && (
                                                    <span className="inline-block mt-2 text-xs font-bold bg-red-200 text-red-900 px-2 py-1 rounded-full">
                                                        INACTIVO
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-3 mb-4 flex-1">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Miembro desde:</span> {new Date(cliente.created_at).toLocaleDateString('es-ES')}
                                                </div>
                                                <div>
                                                    {cliente.ha_pagado_mes_actual ? (
                                                        <div className="bg-green-100 border-l-4 border-green-500 px-4 py-3 rounded flex items-center gap-2">
                                                            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-green-900">✓ Pagado</p>
                                                                <p className="text-sm text-green-700">{mesesNombres[mesActual - 1]} {anoActual}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-red-100 border-l-4 border-red-500 px-4 py-3 rounded flex items-center gap-2">
                                                            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-red-900">✗ Pendiente</p>
                                                                <p className="text-sm text-red-700">{mesesNombres[mesActual - 1]} {anoActual}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                                {!cliente.esta_inactivo && (
                                                    <>
                                                        <Link
                                                            href={route('clientes.show', cliente.id)}
                                                            className="text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                            Ver
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(cliente.id, cliente.name)}
                                                            className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                            🗑 Eliminar
                                                        </button>
                                                    </>
                                                )}
                                                {cliente.esta_inactivo && (
                                                    <button
                                                        onClick={() => handleRestore(cliente.id, cliente.name)}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                        Reactivar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <EmptyState
                                icon={<Users size={48} />}
                                message={initialSearch ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados'}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

