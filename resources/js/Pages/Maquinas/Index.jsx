import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';

export default function Index() {
    const { maquinas, flash, filtros } = usePage().props;
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [loadingEstado, setLoadingEstado] = useState({ id: null, estado: null });
    const [estado, setEstado] = useState(filtros?.estado || '');
    const [zona, setZona] = useState(filtros?.zona || '');
    const estadosDisponibles = filtros?.estados ?? ['operativa', 'mantenimiento', 'fuera_de_servicio'];

    // Sincronizar filtros con props del servidor
    useEffect(() => {
        setEstado(filtros?.estado || '');
        setZona(filtros?.zona || '');
    }, [filtros]);

    // Aplicar filtros automáticamente cuando cambian
    useEffect(() => {
        const params = {};
        if (estado) params.estado = estado;
        if (zona) params.zona = zona;

        router.get(route('maquinas.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [estado, zona]);

    const limpiarFiltros = () => {
        setEstado('');
        setZona('');
    };

    const handleChangeEstado = (maquina, nuevoEstado) => {
        if (!confirm(`¿Cambiar estado de "${maquina.nombre}" a "${nuevoEstado.replaceAll('_', ' ')}"?`)) return;

        setLoadingEstado({ id: maquina.id, estado: nuevoEstado });

        router.patch(
            route('maquinas.estado', maquina.id),
            { estado: nuevoEstado },
            {
                onSuccess: () => {
                    setLoadingEstado({ id: null, estado: null });
                    router.reload();
                },
                onError: () => {
                    setLoadingEstado({ id: null, estado: null });
                    alert('Error al actualizar el estado.');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Máquinas" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Máquinas</h1>

                        {hasAnyRole(['superusuario', 'tecnico']) &&
                            <Link href={route('maquinas.create')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                + Crear Máquina
                            </Link>
                        }
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Filtros</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                                <select
                                    value={zona}
                                    onChange={(e) => setZona(e.target.value)}
                                    className="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todas</option>
                                    {filtros?.zonas?.map((z) => (
                                        <option key={z} value={z}>{z}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos</option>
                                    {estadosDisponibles.map((e) => (
                                        <option key={e} value={e}>{e.replaceAll('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={limpiarFiltros}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded"
                                    disabled={!estado && !zona}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {maquinas?.data?.length > 0 ? (
                            maquinas.data.map((m) => (
                                <div key={m.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                <Link
                                                    href={route('maquinas.show', m.id)}
                                                    className="text-gray-900 hover:text-blue-600 hover:underline"
                                                >
                                                    {m.nombre}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-gray-600">{m.ubicacion} • <span className="capitalize">{m.estado.replaceAll('_', ' ')}</span></p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                {hasAnyRole(['superusuario', 'tecnico']) &&
                                                    <Link href={route('maquinas.edit', m.id)} className="text-yellow-600 hover:text-yellow-800">Editar</Link>
                                                }
                                            </div>

                                            {hasAnyRole(['superusuario', 'tecnico']) && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    {/* Botón mantenimiento / operativa */}
                                                    <button
                                                        onClick={() => handleChangeEstado(m, m.estado === 'mantenimiento' ? 'operativa' : 'mantenimiento')}
                                                        disabled={loadingEstado.id === m.id}
                                                        className={`py-1 px-3 rounded text-white ${m.estado === 'mantenimiento' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                                    >
                                                        {loadingEstado.id === m.id && loadingEstado.estado === (m.estado === 'mantenimiento' ? 'operativa' : 'mantenimiento') ? '...' : (m.estado === 'mantenimiento' ? 'Operativa' : 'Mantenimiento')}
                                                    </button>

                                                    {/* Botón fuera de servicio / operativa */}
                                                    <button
                                                        onClick={() => handleChangeEstado(m, m.estado === 'fuera_de_servicio' ? 'operativa' : 'fuera_de_servicio')}
                                                        disabled={loadingEstado.id === m.id}
                                                        className={`py-1 px-3 rounded text-white ${m.estado === 'fuera_de_servicio' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                                    >
                                                        {loadingEstado.id === m.id && loadingEstado.estado === (m.estado === 'fuera_de_servicio' ? 'operativa' : 'fuera_de_servicio') ? '...' : (m.estado === 'fuera_de_servicio' ? 'Operativa' : 'Fuera de servicio')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {m.descripcion && (
                                        <p className="text-gray-700 mt-3">{m.descripcion}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay máquinas aún.</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-3">
                        {maquinas?.prev_page_url && (
                            <Link href={route('maquinas.index', { page: maquinas.current_page - 1 })} className="bg-gray-200 px-3 py-2 rounded">← Anterior</Link>
                        )}
                        <div className="text-sm text-gray-600">Página {maquinas?.current_page} de {maquinas?.last_page}</div>
                        {maquinas?.next_page_url && (
                            <Link href={route('maquinas.index', { page: maquinas.current_page + 1 })} className="bg-gray-200 px-3 py-2 rounded">Siguiente →</Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
