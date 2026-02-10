import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import GuiaCreateModal from '@/Components/GuiaCreateModal';
import { PageHeader, FlashMessage, Pagination, EmptyState, StatusBadge, FilterPanel } from '@/Components';
import { BookOpen, Check } from 'lucide-react';

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
                    {/* Header con componente reutilizable */}
                    <PageHeader
                        title="Guías de Ejercicios"
                        description="Crea, gestiona y asigna guías de entrenamiento personalizadas"
                        icon={<BookOpen size={36} />}
                    />

                    {/* Flash messages con componente reutilizable */}
                    <FlashMessage />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Sidebar Filtros con componente reutilizable */}
                        <FilterPanel
                            onClear={limpiarFiltros}
                            showClear={nivel || musculoObjetivo}
                        >
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

                            {hasAnyRole(['entrenador', 'jefe_entrenadores', 'superusuario']) && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center mt-2"
                                >
                                    + Nueva Guía
                                </button>
                            )}
                        </FilterPanel>

                        {/* Contenido */}
                        <div className="lg:col-span-9">
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
                                                <StatusBadge status={guia.nivel} variant="info" size="md" />
                                                {musculoObjetivo && guia.ejercicios_con_musculo !== undefined && (
                                                    <StatusBadge
                                                        status={`${guia.ejercicios_con_musculo} ejercicio${guia.ejercicios_con_musculo !== 1 ? 's' : ''}`}
                                                        variant="success"
                                                        size="md"
                                                    />
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
                                            {!hasAnyRole(['entrenador', 'jefe_entrenadores', 'superusuario']) && (
                                                assignedGuiaIds.includes(guia.id) ? (
                                                    <span className="flex-1 text-center bg-purple-100 text-purple-800 font-semibold py-2 px-4 rounded-lg text-sm">
                                                        <Check className="w-4 h-4 inline" /> Asignada
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
                                            {hasAnyRole(['entrenador', 'jefe_entrenadores', 'superusuario']) && (
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
                                    <EmptyState
                                        icon={<BookOpen size={48} />}
                                        message="No hay guías disponibles."
                                        action={
                                            hasAnyRole(['entrenador', 'jefe_entrenadores', 'superusuario']) && (
                                                <button
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                                                >
                                                    + Crear primera guía
                                                </button>
                                            )
                                        }
                                    />
                                )}
                            </div>

                            {/* Paginación con componente reutilizable */}
                            <Pagination
                                data={guias}
                                routeName="guias.index"
                                routeParams={{
                                    nivel: nivel || undefined,
                                    musculo_objetivo: musculoObjetivo || undefined
                                }}
                            />
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
