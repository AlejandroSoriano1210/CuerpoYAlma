import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PanelShow({ horario, inscritos, listaEspera, estadisticas }) {
    const { auth } = usePage().props;
    const [isPromoviendo, setIsPromoviendo] = useState(null);
    const [isRemoviendo, setIsRemoviendo] = useState(null);

    const handlePromover = (item) => {
        if (confirm(`¿Deseas promover a ${item.usuario_nombre} a esta clase?`)) {
            setIsPromoviendo(item.id);

            router.patch(
                route('panel.promover', { horarioClase: horario.id, listaEspera: item.id }),
                {},
                {
                    onSuccess: () => {
                        setIsPromoviendo(null);
                        router.reload();
                    },
                    onError: (errors) => {
                        setIsPromoviendo(null);
                        const errorMsg = errors.error || 'Error al promover el usuario';
                        alert(errorMsg);
                    },
                }
            );
        }
    };

    const handleRemover = (item) => {
        if (confirm(`¿Deseas remover a ${item.usuario_nombre} de la lista de espera?`)) {
            setIsRemoviendo(item.id);

            router.delete(
                route('panel.remover-lista', { horarioClase: horario.id, listaEspera: item.id }),
                {
                    onSuccess: () => {
                        setIsRemoviendo(null);
                        router.reload();
                    },
                    onError: () => {
                        setIsRemoviendo(null);
                        alert('Error al remover del usuario');
                    },
                }
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detalles - ${horario.nombre}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Botón atrás */}
                    <Link
                        href={route('panel.clases.index')}
                        className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Volver al Panel
                    </Link>

                    {/* Header de la clase */}
                    <div className="bg-white rounded-lg shadow p-8 mb-6">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{horario.nombre}</h1>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div>
                                <p className="text-sm text-gray-600">FECHA</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {new Date(horario.fecha).toLocaleDateString('es-ES', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">HORARIO</p>
                                <p className="text-lg font-bold text-gray-900">{horario.hora_inicio} - {horario.hora_fin}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">CAPACIDAD</p>
                                <p className="text-lg font-bold text-gray-900">{horario.capacidad} personas</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ESTADO</p>
                                <p className={`text-lg font-bold ${
                                    estadisticas.espacios_disponibles > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {estadisticas.espacios_disponibles > 0 ? '✓ Disponible' : '✕ Completa'}
                                </p>
                            </div>
                        </div>

                        {horario.descripcion && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm font-medium text-gray-900 mb-1">Descripción:</p>
                                <p className="text-gray-700">{horario.descripcion}</p>
                            </div>
                        )}
                    </div>

                    {/* Estadísticas principales */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 font-medium">INSCRITOS</p>
                            <p className="text-3xl font-bold text-green-600">{estadisticas.total_inscritos}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 font-medium">ESPACIOS DISPONIBLES</p>
                            <p className="text-3xl font-bold text-blue-600">{estadisticas.espacios_disponibles}</p>
                        </div>
                        <div className={`${estadisticas.en_lista_espera > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                            <p className="text-sm text-gray-600 font-medium">EN LISTA DE ESPERA</p>
                            <p className={`text-3xl font-bold ${estadisticas.en_lista_espera > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                                {estadisticas.en_lista_espera}
                            </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 font-medium">OCUPACIÓN</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {Math.round((estadisticas.total_inscritos / estadisticas.capacidad) * 100)}%
                            </p>
                        </div>
                    </div>

                    {/* Inscritos */}
                    <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                👥 Inscritos ({inscritos.length}/{horario.capacidad})
                            </h2>
                        </div>

                        {inscritos.length > 0 ? (
                            <div className="divide-y">
                                {inscritos.map((usuario) => (
                                    <div
                                        key={usuario.id}
                                        className="p-6 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-900">{usuario.usuario_nombre}</p>
                                                <p className="text-sm text-gray-600">{usuario.usuario_email}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Estado: <span className="font-medium capitalize">{usuario.estado}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded">
                                                    ✓ Confirmado
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                No hay inscritos aún
                            </div>
                        )}
                    </div>

                    {/* Lista de Espera */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                ⏳ Lista de Espera ({listaEspera.length})
                            </h2>
                        </div>

                        {listaEspera.length > 0 ? (
                            <div className="divide-y">
                                {listaEspera.map((usuario) => (
                                    <div
                                        key={usuario.id}
                                        className="p-6 hover:bg-amber-50 transition"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4">
                                                    <span className="inline-flex items-center justify-center w-10 h-10 bg-amber-200 text-amber-800 font-bold rounded-full text-lg">
                                                        #{usuario.posicion}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{usuario.usuario_nombre}</p>
                                                        <p className="text-sm text-gray-600">{usuario.usuario_email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                {estadisticas.espacios_disponibles > 0 && (
                                                    <button
                                                        onClick={() => handlePromover(usuario)}
                                                        disabled={isPromoviendo === usuario.id}
                                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition text-sm"
                                                    >
                                                        {isPromoviendo === usuario.id ? 'Promoviendo...' : 'Promover'}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleRemover(usuario)}
                                                    disabled={isRemoviendo === usuario.id}
                                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition text-sm"
                                                >
                                                    {isRemoviendo === usuario.id ? 'Removiendo...' : 'Remover'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                📭 No hay usuarios en lista de espera
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
