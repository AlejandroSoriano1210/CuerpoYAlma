import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { BackLink, FlashMessage, StatusBadge } from '@/Components';
import { Wrench, DollarSign } from 'lucide-react';

const DIAS_SEMANA = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];

export default function Show({ entrenador }) {
    const getRoleBadge = (rol) => {
        const colors = {
            entrenador: 'bg-blue-100 text-blue-800',
            tecnico: 'bg-green-100 text-green-800',
            limpieza: 'bg-purple-100 text-purple-800',
        };
        return colors[rol] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Empleado: ${entrenador.name}`} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BackLink href={route('entrenadores.index')} text="Volver a Empleados" />

                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-3xl font-bold mb-6 text-gray-900">
                            {entrenador.name}
                        </h1>

                        <FlashMessage />

                        {/* Información Personal */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Información Personal
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Nombre
                                    </label>
                                    <p className="text-gray-900 text-lg font-medium">
                                        {entrenador.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Email
                                    </label>
                                    <p className="text-gray-900 text-lg font-medium">
                                        {entrenador.email}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Teléfono
                                    </label>
                                    <p className="text-gray-900 text-lg font-medium">
                                        {entrenador.telefono || 'No especificado'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Rol
                                    </label>
                                    <StatusBadge
                                        status={entrenador.rol}
                                        customColors={{
                                            entrenador: { bg: 'bg-blue-100', text: 'text-blue-800' },
                                            tecnico: { bg: 'bg-green-100', text: 'text-green-800' },
                                            limpieza: { bg: 'bg-purple-100', text: 'text-purple-800' },
                                        }}
                                        size="md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Fecha de Registro
                                    </label>
                                    <p className="text-gray-900 text-lg font-medium">
                                        {new Date(
                                            entrenador.created_at
                                        ).toLocaleDateString("es-ES")}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">
                                        Última Actualización
                                    </label>
                                    <p className="text-gray-900 text-lg font-medium">
                                        {new Date(
                                            entrenador.updated_at
                                        ).toLocaleDateString("es-ES")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Horario de Trabajo */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Horario de Trabajo
                            </h2>

                            {entrenador.horarioTrabajo &&
                            Object.keys(entrenador.horarioTrabajo).length >
                                0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {DIAS_SEMANA.map((dia, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border-2 ${
                                                entrenador.horarioTrabajo[
                                                    index
                                                ] &&
                                                entrenador.horarioTrabajo[index]
                                                    .length > 0
                                                    ? "bg-green-50 border-green-200"
                                                    : "bg-gray-100 border-gray-200"
                                            }`}
                                        >
                                            <h3 className="font-semibold text-gray-900 mb-2">
                                                {dia}
                                            </h3>

                                            {entrenador.horarioTrabajo[index] &&
                                            entrenador.horarioTrabajo[index]
                                                .length > 0 ? (
                                                <div className="space-y-2">
                                                    {entrenador.horarioTrabajo[
                                                        index
                                                    ].map(
                                                        (bloque, bloqueIdx) => (
                                                            <div
                                                                key={bloqueIdx}
                                                                className="bg-white p-2 rounded border border-green-200"
                                                            >
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        bloque.hora_inicio
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        bloque.hora_fin
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">
                                                    Sin horario
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    No hay horario de trabajo asignado
                                </p>
                            )}
                        </div>

                        {/* Clases que Imparte (solo para entrenadores) */}
                        {entrenador.rol === 'entrenador' && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        Clases que Imparte (
                                        {entrenador.clasesCreadas?.length || 0})
                                    </h2>

                                    {entrenador.clasesEsteAno !== undefined && (
                                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                                            <span className="text-sm font-medium">Clases este año ({new Date().getFullYear()}): </span>
                                            <span className="text-2xl font-bold">{entrenador.clasesEsteAno}</span>
                                        </div>
                                    )}
                                </div>

                                {entrenador.clasesCreadas &&
                                entrenador.clasesCreadas.length > 0 ? (
                                    <div className="space-y-4">
                                        {entrenador.clasesCreadas.map((clase) => (
                                            <div
                                                key={clase.id}
                                                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            {clase.nombre}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            📅{" "}
                                                            {new Date(
                                                                clase.fecha
                                                            ).toLocaleDateString(
                                                                "es-ES",
                                                                {
                                                                    weekday: "long",
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            clase.inscritos >=
                                                            clase.capacidad
                                                                ? "bg-red-200 text-red-800"
                                                                : "bg-green-200 text-green-800"
                                                        }`}
                                                    >
                                                        {clase.inscritos}/
                                                        {clase.capacidad}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">
                                                            ⏰ Horario:
                                                        </span>
                                                        <p className="font-medium text-gray-900">
                                                            {clase.hora_inicio} -{" "}
                                                            {clase.hora_fin}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">
                                                            👥 Capacidad:
                                                        </span>
                                                        <p className="font-medium text-gray-900">
                                                            {clase.capacidad}{" "}
                                                            personas
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        No ha creado clases aún
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Máquinas en Mantenimiento (solo para técnicos) */}
                        {entrenador.rol === 'tecnico' && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                    Máquinas en Mantenimiento/Fuera de Servicio (
                                    {entrenador.maquinasMantenimiento?.length || 0})
                                </h2>

                                {entrenador.maquinasMantenimiento &&
                                entrenador.maquinasMantenimiento.length > 0 ? (
                                    <div className="space-y-4">
                                        {entrenador.maquinasMantenimiento.map((maquina) => (
                                            <div
                                                key={maquina.id}
                                                className={`p-4 border rounded-lg ${
                                                    maquina.estado === 'mantenimiento'
                                                        ? 'bg-yellow-50 border-yellow-200'
                                                        : 'bg-red-50 border-red-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            {maquina.nombre}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            📍 {maquina.ubicacion}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                                            maquina.estado === 'mantenimiento'
                                                                ? 'bg-yellow-200 text-yellow-800'
                                                                : 'bg-red-200 text-red-800'
                                                        }`}
                                                    >
                                                        {maquina.estado.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                {maquina.descripcion && (
                                                    <p className="text-sm text-gray-700 mt-2">
                                                        {maquina.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        No hay máquinas en mantenimiento o fuera de servicio
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Historial de Reportes de Reparación (solo para técnicos) */}
                        {entrenador.rol === 'tecnico' && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                        <Wrench className="text-gray-600" size={20} />
                                        Historial de Reparaciones ({entrenador.totalReportes || 0})
                                    </h2>

                                    <div className="flex gap-4">
                                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <DollarSign size={18} />
                                            <div>
                                                <span className="text-xs font-medium">Total reparaciones</span>
                                                <p className="text-lg font-bold">
                                                    {parseFloat(entrenador.totalCosteReparaciones || 0).toFixed(2)} €
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {entrenador.reportes && entrenador.reportes.length > 0 ? (
                                    <div className="space-y-4">
                                        {entrenador.reportes.map((reporte) => (
                                            <div
                                                key={reporte.id}
                                                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                                    <div>
                                                        <Link
                                                            href={route('maquinas.show', reporte.maquina_id)}
                                                            className="font-bold text-gray-900 text-lg hover:text-blue-600"
                                                        >
                                                            {reporte.maquina_nombre}
                                                        </Link>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                reporte.estado_anterior === 'mantenimiento'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {reporte.estado_anterior.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                operativa
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(reporte.created_at).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Tiempo:</span>
                                                        <p className="font-medium text-gray-900">
                                                            {reporte.tiempo_reparacion} {
                                                                reporte.unidad_tiempo === 'minutos'
                                                                    ? (reporte.tiempo_reparacion === 1 ? 'minuto' : 'minutos')
                                                                    : reporte.unidad_tiempo === 'horas'
                                                                    ? (reporte.tiempo_reparacion === 1 ? 'hora' : 'horas')
                                                                    : (reporte.tiempo_reparacion === 1 ? 'día' : 'días')
                                                            }
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
                                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <span className="text-gray-500 text-sm">Notas:</span>
                                                        <p className="text-gray-700 text-sm mt-1">{reporte.notas}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <Wrench className="mx-auto text-gray-300 mb-3" size={48} />
                                        <p className="text-gray-500">No hay reportes de reparación registrados.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex gap-4">
                            <Link
                                href={route("entrenadores.edit", entrenador.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                            >
                                Editar
                            </Link>

                            <Link
                                href={route("entrenadores.index")}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
                            >
                                Volver
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
