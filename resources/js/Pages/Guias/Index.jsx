import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';

export default function GuiasIndex() {
    const { hasAnyRole } = usaRoleUser();
    const { guias, flash, niveles, musculos, filtrosActivos, assignedGuiaIds = [] } = usePage().props;
    const [nivel, setNivel] = useState(filtrosActivos?.nivel || '');
    const [musculoObjetivo, setMusculoObjetivo] = useState(filtrosActivos?.musculo_objetivo || '');
    const [isFilteringActive, setIsFilteringActive] = useState(false);

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

    return (
        <AuthenticatedLayout>
            <Head title="Guías" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Guías de ejercicios</h1>

                        {hasAnyRole(['entrenador', 'superusuario']) && (
                            <Link
                                href={route('guias.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                + Crear Guía
                            </Link>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="font-bold text-lg text-gray-900 mb-4">Filtros</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                                <select
                                    value={nivel}
                                    onChange={(e) => {
                                        setNivel(e.target.value);
                                        setIsFilteringActive(true);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Músculo objetivo</label>
                                <select
                                    value={musculoObjetivo}
                                    onChange={(e) => {
                                        setMusculoObjetivo(e.target.value);
                                        setIsFilteringActive(true);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

                        <div className="flex gap-2">
                            <button
                                onClick={limpiarFiltros}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {guias?.data?.length > 0 ? (
                            guias.data.map((guia) => (
                                <div key={guia.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <Link href={route('guias.show', guia.id)}>
                                                <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">{guia.titulo}</h3>
                                            </Link>
                                            <p className="text-sm text-gray-600">Nivel: {guia.nivel}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={route('guias.show', guia.id)} className="text-blue-600 hover:text-blue-900">
                                                Ver
                                            </Link>
                                            {!hasAnyRole(['entrenador', 'superusuario']) && (
                                                assignedGuiaIds.includes(guia.id) ? (
                                                    <span className="text-purple-600 font-semibold text-sm">
                                                        ✓ Asignada
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            router.post(route('guias.assign', guia.id));
                                                        }}
                                                        className="text-green-600 hover:text-green-900 font-semibold"
                                                    >
                                                        Asignar
                                                    </button>
                                                )
                                            )}
                                            {hasAnyRole(['entrenador', 'superusuario']) && (
                                                <Link href={route('guias.edit', guia.id)} className="text-yellow-600 hover:text-yellow-800">
                                                    Editar
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {guia.contenido && (
                                        <p className="text-gray-700 mt-3">{guia.contenido.substring(0, 200)}{guia.contenido.length > 200 ? '...' : ''}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay guías aún.</p>
                        )}
                    </div>

                    {/* Paginación simple */}
                    <div className="mt-6 flex justify-center items-center gap-3">
                        {guias?.prev_page_url && (
                            <Link href={route('guias.index', {
                                page: guias.current_page - 1,
                                nivel: nivel || undefined,
                                musculo_objetivo: musculoObjetivo || undefined
                            })} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">← Anterior</Link>
                        )}
                        <div className="text-sm text-gray-600">Página {guias?.current_page} de {guias?.last_page}</div>
                        {guias?.next_page_url && (
                            <Link href={route('guias.index', {
                                page: guias.current_page + 1,
                                nivel: nivel || undefined,
                                musculo_objetivo: musculoObjetivo || undefined
                            })} className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300">Siguiente →</Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
