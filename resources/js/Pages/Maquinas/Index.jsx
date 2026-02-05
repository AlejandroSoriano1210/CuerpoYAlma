import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import MaquinaCreateModal from '@/Components/MaquinaCreateModal';
import MaquinaReporteModal from '@/Components/MaquinaReporteModal';
import { PageHeader, FlashMessage, Pagination, EmptyState, StatusBadge, FilterPanel } from '@/Components';
import { Dumbbell } from 'lucide-react';

export default function Index() {
    const { maquinas, flash, filtros } = usePage().props;
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [loadingEstado, setLoadingEstado] = useState({ id: null, estado: null });
    const [estado, setEstado] = useState(filtros?.estado || '');
    const [zona, setZona] = useState(filtros?.zona || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isReporteModalOpen, setIsReporteModalOpen] = useState(false);
    const [maquinaReporte, setMaquinaReporte] = useState(null);
    const [estadoAnteriorReporte, setEstadoAnteriorReporte] = useState(null);
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
        // Si cambia de mantenimiento/fuera_de_servicio a operativa, mostrar modal de reporte
        if (nuevoEstado === 'operativa' && (maquina.estado === 'mantenimiento' || maquina.estado === 'fuera_de_servicio')) {
            setMaquinaReporte(maquina);
            setEstadoAnteriorReporte(maquina.estado);
            setIsReporteModalOpen(true);
            return;
        }

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

    const handleReporteSuccess = () => {
        setIsReporteModalOpen(false);
        setMaquinaReporte(null);
        setEstadoAnteriorReporte(null);
        router.reload();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Máquinas" />

            <div className="min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header con componente reutilizable */}
                    <PageHeader
                        title="Máquinas del Gimnasio"
                        description="Gestiona y visualiza el estado de todas las máquinas"
                        icon={<Dumbbell size={36} />}
                        actions={
                            hasAnyRole(['superusuario', 'tecnico']) && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition"
                                >
                                    + Nueva Máquina
                                </button>
                            )
                        }
                    />

                    {/* Flash messages con componente reutilizable */}
                    <FlashMessage />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Sidebar Filtros con componente reutilizable */}
                        <FilterPanel
                            onClear={limpiarFiltros}
                            showClear={estado || zona}
                        >
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
                        </FilterPanel>

                        {/* Contenido */}
                        <div className="lg:col-span-9">
                            {/* Lista de máquinas */}
                            <div className="space-y-4">
                                {maquinas?.data?.length > 0 ? (
                                    maquinas.data.map((m) => (
                                        <div key={m.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6">
                                            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                                                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                                    {m.imagen_url && (
                                                        <img
                                                            src={m.imagen_url}
                                                            alt={`Foto de ${m.nombre}`}
                                                            className="h-28 w-full sm:w-32 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <Link
                                                            href={route('maquinas.show', m.id)}
                                                            className="text-xl font-bold text-gray-900 hover:text-green-600 transition"
                                                        >
                                                            {m.nombre}
                                                        </Link>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                            <span>{m.ubicacion}</span>
                                                            <StatusBadge status={m.estado} size="md" />
                                                        </div>
                                                        {m.descripcion && (
                                                            <p className="text-gray-700 mt-3">{m.descripcion}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                                    {hasAnyRole(['superusuario', 'tecnico']) && (
                                                        <>
                                                            <Link
                                                                href={route('maquinas.edit', m.id)}
                                                                className="px-4 py-2 rounded-lg transition font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 text-center"
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
                                    <EmptyState
                                        icon={<Dumbbell size={48} />}
                                        message="No hay máquinas registradas"
                                        action={
                                            hasAnyRole(['superusuario', 'tecnico']) && (
                                                <button
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                                                >
                                                    + Crear primera máquina
                                                </button>
                                            )
                                        }
                                    />
                                )}
                            </div>

                            {/* Paginación con componente reutilizable */}
                            <Pagination data={maquinas} routeName="maquinas.index" />
                        </div>
                    </div>
                </div>
            </div>

            <MaquinaCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.reload()}
            />

            <MaquinaReporteModal
                isOpen={isReporteModalOpen}
                onClose={() => {
                    setIsReporteModalOpen(false);
                    setMaquinaReporte(null);
                    setEstadoAnteriorReporte(null);
                }}
                onSuccess={handleReporteSuccess}
                maquina={maquinaReporte}
                estadoAnterior={estadoAnteriorReporte}
            />
        </AuthenticatedLayout>
    );
}
