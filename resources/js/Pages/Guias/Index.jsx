import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import GuiaCreateModal from '@/Components/GuiaCreateModal';
import { BookOpen, RotateCcw } from 'lucide-react';

export default function GuiasIndex() {
    const { hasAnyRole } = usaRoleUser();
    const { guias, flash, niveles, musculos, filtrosActivos, assignedGuiaIds = [], ejercicios } = usePage().props;
    const [nivel, setNivel] = useState(filtrosActivos?.nivel || '');
    const [musculoObjetivo, setMusculoObjetivo] = useState(filtrosActivos?.musculo_objetivo || '');
    const [isFilteringActive, setIsFilteringActive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Actualizar filtros cuando cambian los props
    useEffect(() => {
        setNivel(filtrosActivos?.nivel || '');
        setMusculoObjetivo(filtrosActivos?.musculo_objetivo || '');
    }, [filtrosActivos]);

    // Aplicar filtros automáticamente cuando cambian (pero no en cambios de página)
    useEffect(() => {
        if (isFilteringActive) {
            const params = {};
            if (nivel) params.nivel = nivel;
            if (musculoObjetivo) params.musculo_objetivo = musculoObjetivo;

            router.get(route('guias.index'), params, {
                preserveState: false,
                preserveScroll: true,
                replace: true,
            });
            setIsFilteringActive(false);
        }
    }, [isFilteringActive]);

    const handleFilterChange = () => {
        setIsFilteringActive(true);
    };

    const limpiarFiltros = () => {
        setNivel('');
        setMusculoObjetivo('');
        setIsFilteringActive(true);
    };

    const handleDeleteGuia = (guiaId, guiaTitulo) => {
        if (confirm(`¿Estás seguro de que deseas eliminar la guía "${guiaTitulo}"? Esta acción no se puede deshacer.`)) {
            router.delete(route('guias.destroy', guiaId), {
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Guías" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                            <BookOpen className="text-green-600" size={36} />
                            Guías de Ejercicios
                        </h1>
                        <p className="text-gray-300">Crea, gestiona y asigna guías de entrenamiento personalizadas</p>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Sidebar Filtros */}
                        <aside className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        <RotateCcw size={20} className="text-gray-600" />
                                        Filtros
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsFiltersOpen((prev) => !prev)}
                                        className="lg:hidden text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {isFiltersOpen ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                </div>
                                <div className={`${isFiltersOpen ? 'block' : 'hidden'} lg:block`}>
                                    <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nivel</label>
                                        <select
                                            value={nivel}
                                            onChange={(e) => {
                                                setNivel(e.target.value);
                                                setIsFilteringActive(true);
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                        >
                                            <option value="">Todos los niveles</option>
                                            {niveles?.map((n) => (
                                                <option key={n} value={n}>
                                                    {n.charAt(0).toUpperCase() + n.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Músculo objetivo</label>
                                        <select
                                            value={musculoObjetivo}
                                            onChange={(e) => {
                                                setMusculoObjetivo(e.target.value);
                                                setIsFilteringActive(true);
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                        >
                                            <option value="">Todos los músculos</option>
                                            {musculos?.map((m) => (
                                                <option key={m} value={m}>
                                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={limpiarFiltros}
                                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                                        >
                                            Limpiar Filtros
                                        </button>
                                        {hasAnyRole(['entrenador', 'superusuario']) && (
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
                                            >
                                                + Nueva Guía
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Contenido */}
                        <div className="lg:col-span-9">
                            {flash?.success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {flash.success}
                                </div>
                            )}

                            {/* Guías Grid */}
                            <div>
                                {guias?.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {guias.data.map((guia) => (
                                    <div key={guia.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex flex-col">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <Link href={route('guias.show', guia.id)}>
                                                <h3 className="font-bold text-lg text-gray-900 hover:text-green-600 cursor-pointer transition-colors mb-1">{guia.titulo}</h3>
                                            </Link>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {guia.nivel.charAt(0).toUpperCase() + guia.nivel.slice(1)}
                                                </span>
                                                {musculoObjetivo && guia.ejercicios_con_musculo !== undefined && (
                                                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                        {guia.ejercicios_con_musculo} ejercicio{guia.ejercicios_con_musculo !== 1 ? 's' : ''} {musculoObjetivo.charAt(0).toUpperCase() + musculoObjetivo.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Preview */}
                                        {guia.contenido && (
                                            <p className="text-gray-600 text-sm mb-4 flex-1">{guia.contenido.substring(0, 150)}{guia.contenido.length > 150 ? '...' : ''}</p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                            <Link href={route('guias.show', guia.id)} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                Ver
                                            </Link>
                                            {!hasAnyRole(['entrenador', 'superusuario']) && (
                                                assignedGuiaIds.includes(guia.id) ? (
                                                    <span className="flex-1 text-center bg-purple-100 text-purple-800 font-semibold py-2 px-4 rounded-lg text-sm">
                                                        ✓ Asignada
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                router.post(route('guias.assign', guia.id));
                                                            }}
                                                            className="flex-1 text-center bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 px-4 rounded-lg transition text-sm"
                                                        >
                                                            Asignar
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                router.post(route('guias.assign', guia.id), { semanal: true });
                                                            }}
                                                            className="flex-1 text-center bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-2 px-4 rounded-lg transition text-sm"
                                                        >
                                                            Semanal
                                                        </button>
                                                    </>
                                                )
                                            )}
                                            {hasAnyRole(['entrenador', 'superusuario']) && (
                                                <>
                                                    <Link href={route('guias.edit', guia.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteGuia(guia.id, guia.titulo)}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                        <p className="text-gray-500 text-lg">No hay guías disponibles.</p>
                                    </div>
                                )}
                            </div>

                            {/* Paginación */}
                            <div className="mt-8 flex justify-center items-center gap-3">
                                {guias?.prev_page_url && (
                                    <Link href={route('guias.index', {
                                        page: guias.current_page - 1,
                                        nivel: nivel || undefined,
                                        musculo_objetivo: musculoObjetivo || undefined
                                    })} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition">← Anterior</Link>
                                )}
                                <div className="text-sm text-gray-600">Página {guias?.current_page} de {guias?.last_page}</div>
                                {guias?.next_page_url && (
                                    <Link href={route('guias.index', {
                                        page: guias.current_page + 1,
                                        nivel: nivel || undefined,
                                        musculo_objetivo: musculoObjetivo || undefined
                                    })} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition">Siguiente →</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <GuiaCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.reload()}
                ejercicios={ejercicios || []}
            />
        </AuthenticatedLayout>
    );
}
