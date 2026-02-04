import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import MaquinaCreateModal from '@/Components/MaquinaCreateModal';
import { Dumbbell, RotateCcw } from 'lucide-react';

export default function Index() {
    const { maquinas, flash, filtros } = usePage().props;
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [loadingEstado, setLoadingEstado] = useState({ id: null, estado: null });
    const [estado, setEstado] = useState(filtros?.estado || '');
    const [zona, setZona] = useState(filtros?.zona || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
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

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                                    <Dumbbell className="text-green-600" size={36} />
                                    Máquinas del Gimnasio
                                </h1>
                                <p className="text-gray-600 mt-2">Gestiona y visualiza el estado de todas las máquinas</p>
                            </div>

                            {hasAnyRole(['superusuario', 'tecnico']) && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition"
                                >
                                    + Nueva Máquina
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Alertas */}
                    {flash?.success && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                            <span className="text-lg">✓</span>
                            {flash.success}
                        </div>
                    )}

                    {/* Filtros */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <RotateCcw size={20} className="text-gray-600" />
                                Filtros
                            </h2>
                            {(estado || zona) && (
                                <button
                                    onClick={limpiarFiltros}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>
                                <select
                                    value={zona}
                                    onChange={(e) => setZona(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Todas las zonas</option>
                                    {filtros?.zonas?.map((z) => (
                                        <option key={z} value={z}>{z}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Todos los estados</option>
                                    {estadosDisponibles.map((e) => (
                                        <option key={e} value={e}>{e.replaceAll('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de máquinas */}
                    <div className="space-y-4">
                        {maquinas?.data?.length > 0 ? (
                            maquinas.data.map((m) => (
                                <div key={m.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <Link
                                                href={route('maquinas.show', m.id)}
                                                className="text-xl font-bold text-gray-900 hover:text-green-600 transition"
                                            >
                                                {m.nombre}
                                            </Link>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span>{m.ubicacion}</span>
                                                <span className={`px-3 py-1 rounded-full font-medium ${
                                                    m.estado === 'operativa' ? 'bg-green-100 text-green-800' :
                                                    m.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {m.estado.replaceAll('_', ' ')}
                                                </span>
                                            </div>
                                            {m.descripcion && (
                                                <p className="text-gray-700 mt-3">{m.descripcion}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {hasAnyRole(['superusuario', 'tecnico']) && (
                                                <>
                                                    <Link
                                                        href={route('maquinas.edit', m.id)}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleChangeEstado(m, m.estado === 'mantenimiento' ? 'operativa' : 'mantenimiento')}
                                                        disabled={loadingEstado.id === m.id}
                                                        className={`px-4 py-2 rounded-lg transition font-medium text-sm text-white ${
                                                            m.estado === 'mantenimiento'
                                                                ? 'bg-green-600 hover:bg-green-700'
                                                                : 'bg-yellow-500 hover:bg-yellow-600'
                                                        }`}
                                                    >
                                                        {loadingEstado.id === m.id ? '...' : (m.estado === 'mantenimiento' ? 'Operativa' : 'Mantenimiento')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleChangeEstado(m, m.estado === 'fuera_de_servicio' ? 'operativa' : 'fuera_de_servicio')}
                                                        disabled={loadingEstado.id === m.id}
                                                        className={`px-4 py-2 rounded-lg transition font-medium text-sm text-white ${
                                                            m.estado === 'fuera_de_servicio'
                                                                ? 'bg-green-600 hover:bg-green-700'
                                                                : 'bg-red-600 hover:bg-red-700'
                                                        }`}
                                                    >
                                                        {loadingEstado.id === m.id ? '...' : (m.estado === 'fuera_de_servicio' ? 'Operativa' : 'Fuera de servicio')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No hay máquinas registradas</p>
                            </div>
                        )}
                    </div>

                    {/* Paginación */}
                    {(maquinas?.prev_page_url || maquinas?.next_page_url) && (
                        <div className="mt-8 flex justify-center items-center gap-3">
                            {maquinas?.prev_page_url && (
                                <Link href={route('maquinas.index', { page: maquinas.current_page - 1 })} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">← Anterior</Link>
                            )}
                            <span className="text-sm text-gray-600 font-medium">Página {maquinas?.current_page} de {maquinas?.last_page}</span>
                            {maquinas?.next_page_url && (
                                <Link href={route('maquinas.index', { page: maquinas.current_page + 1 })} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Siguiente →</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <MaquinaCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
