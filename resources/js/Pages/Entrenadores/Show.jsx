import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const DIAS_SEMANA = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
];

export default function Show({ entrenador }) {
    const { flash } = usePage().props;

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
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-3xl font-bold mb-6 text-gray-900">
                            {entrenador.name}
                        </h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

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
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRoleBadge(entrenador.rol)}`}>
                                        {entrenador.rol.charAt(0).toUpperCase() + entrenador.rol.slice(1)}
                                    </span>
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
