import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import { BackLink, FlashMessage, StatusBadge, StatCard, EmptyState } from '@/Components';
import { Wrench, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

export default function Show({ maquina, reportes, estadisticas }) {
    const { hasAnyRole } = usaRoleUser();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTiempo = (tiempo, unidad) => {
        const unidadFormateada = {
            minutos: tiempo === 1 ? 'minuto' : 'minutos',
            horas: tiempo === 1 ? 'hora' : 'horas',
            dias: tiempo === 1 ? 'día' : 'días',
        };
        return `${tiempo} ${unidadFormateada[unidad] || unidad}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title={maquina.nombre} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BackLink href={route('maquinas.index')} text="Volver a Máquinas" />

                    <FlashMessage />

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        {maquina.imagen_url && (
                            <img
                                src={maquina.imagen_url}
                                alt={`Foto de ${maquina.nombre}`}
                                className="mb-4 h-56 w-full rounded-lg object-cover"
                            />
                        )}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{maquina.nombre}</h1>
                        <p className="text-sm text-gray-600 mb-2">Ubicación: {maquina.ubicacion}</p>
                        <p className="text-sm text-gray-600 mb-4">
                            Estado: <StatusBadge status={maquina.estado} />
                        </p>

                        {maquina.descripcion ? <p className="text-gray-700">{maquina.descripcion}</p> : <p className="text-gray-500">Sin descripción.</p>}

                        <div className="mt-4">
                            {hasAnyRole(['superusuario', 'tecnico', 'jefe_tecnicos']) &&
                                <Link href={route('maquinas.edit', maquina.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Editar</Link>
                            }
                        </div>
                    </div>

                    {/* Sección de estadísticas y reportes - Solo para técnicos y superusuarios */}
                    {hasAnyRole(['superusuario', 'tecnico', 'jefe_tecnicos']) && (
                        <>
                            {/* Tarjetas de estadísticas con componente reutilizable */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <StatCard
                                    title="Fecha de registro"
                                    value={new Date(estadisticas?.fecha_registro).toLocaleDateString('es-ES')}
                                    icon={<Calendar size={24} />}
                                    iconBgColor="bg-blue-100"
                                    iconColor="text-blue-600"
                                />
                                <StatCard
                                    title="Veces en reparación"
                                    value={estadisticas?.veces_en_reparacion || 0}
                                    icon={<AlertTriangle size={24} />}
                                    iconBgColor="bg-yellow-100"
                                    iconColor="text-yellow-600"
                                />
                                <StatCard
                                    title="Total en reparaciones"
                                    value={`${parseFloat(estadisticas?.total_reparaciones || 0).toFixed(2)} €`}
                                    icon={<DollarSign size={24} />}
                                    iconBgColor="bg-green-100"
                                    iconColor="text-green-600"
                                />
                            </div>

                            {/* Historial de reportes */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wrench className="text-gray-600" size={24} />
                                    Historial de Reparaciones
                                </h2>

                                {reportes && reportes.length > 0 ? (
                                    <div className="space-y-4">
                                        {reportes.map((reporte) => (
                                            <div key={reporte.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={reporte.estado_anterior} />
                                                        <span className="text-gray-400">→</span>
                                                        <StatusBadge status="operativa" />
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(reporte.created_at)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Técnico:</span>
                                                        <p className="font-medium text-gray-900">{reporte.tecnico?.name || 'Desconocido'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Tiempo:</span>
                                                        <p className="font-medium text-gray-900">
                                                            {formatTiempo(reporte.tiempo_reparacion, reporte.unidad_tiempo)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Coste:</span>
                                                        <p className="font-medium text-green-600">
                                                            {parseFloat(reporte.coste_reparacion).toFixed(2)} €
                                                        </p>
                                                    </div>
                                                </div>

                                                {reporte.notas && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <span className="text-gray-500 text-sm">Notas:</span>
                                                        <p className="text-gray-700 text-sm mt-1">{reporte.notas}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={<Wrench size={48} />}
                                        message="No hay reportes de reparación registrados."
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
