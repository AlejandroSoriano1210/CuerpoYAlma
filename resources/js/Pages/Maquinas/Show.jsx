import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import { Wrench, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

export default function Show({ maquina, reportes, estadisticas }) {
    const { flash } = usePage().props;
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
                    <Link href={route('maquinas.index')} className="text-blue-600 mb-6 inline-block">← Volver a Máquinas</Link>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

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
                        <p className="text-sm text-gray-600 mb-4">Estado: <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                            maquina.estado === 'operativa' ? 'bg-green-100 text-green-800' :
                            maquina.estado === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>{maquina.estado.replaceAll('_', ' ')}</span></p>

                        {maquina.descripcion ? <p className="text-gray-700">{maquina.descripcion}</p> : <p className="text-gray-500">Sin descripción.</p>}

                        <div className="mt-4">
                            {hasAnyRole(['superusuario', 'tecnico']) &&
                                <Link href={route('maquinas.edit', maquina.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Editar</Link>
                            }
                        </div>
                    </div>

                    {/* Sección de estadísticas y reportes - Solo para técnicos y superusuarios */}
                    {hasAnyRole(['superusuario', 'tecnico']) && (
                        <>
                            {/* Tarjetas de estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <Calendar className="text-blue-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha de registro</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {new Date(estadisticas?.fecha_registro).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 p-3 rounded-lg">
                                            <AlertTriangle className="text-yellow-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Veces en reparación</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {estadisticas?.veces_en_reparacion || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <DollarSign className="text-green-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total en reparaciones</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {parseFloat(estadisticas?.total_reparaciones || 0).toFixed(2)} €
                                            </p>
                                        </div>
                                    </div>
                                </div>
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
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            reporte.estado_anterior === 'mantenimiento'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {reporte.estado_anterior.replaceAll('_', ' ')}
                                                        </span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            operativa
                                                        </span>
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
                                    <div className="text-center py-8">
                                        <Wrench className="mx-auto text-gray-300 mb-3" size={48} />
                                        <p className="text-gray-500">No hay reportes de reparación registrados.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
