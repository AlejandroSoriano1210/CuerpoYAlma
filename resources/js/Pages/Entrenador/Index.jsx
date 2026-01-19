import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PanelIndex({ clases, mes, ano, mesNombre }) {
    const { auth } = usePage().props;

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoAnterior = mes === 1 ? ano - 1 : ano;

    const mesSiguiente = mes === 12 ? 1 : mes + 1;
    const anoSiguiente = mes === 12 ? ano + 1 : ano;

    return (
        <AuthenticatedLayout>
            <Head title="Panel de Entrenador" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Mi Panel de Entrenador</h1>
                            <p className="text-gray-600 mt-2">Gestiona tus clases, listas de espera y reservas</p>
                        </div>
                    </div>

                    {/* Navegación de meses */}
                    <div className="mb-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
                        <Link
                            href={route('panel.clases.index', { mes: mesAnterior, ano: anoAnterior })}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            ← Anterior
                        </Link>

                        <h2 className="text-2xl font-bold text-gray-900">
                            {mesNombre} {ano}
                        </h2>

                        <Link
                            href={route('panel.clases.index', { mes: mesSiguiente, ano: anoSiguiente })}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Siguiente →
                        </Link>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-gray-600 text-sm font-medium">CLASES ESTE MES</div>
                            <div className="text-4xl font-bold text-blue-600 mt-2">{clases.length}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-gray-600 text-sm font-medium">EN LISTA DE ESPERA</div>
                            <div className="text-4xl font-bold text-amber-600 mt-2">
                                {clases.reduce((sum, c) => sum + c.lista_espera_count, 0)}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-gray-600 text-sm font-medium">CLASES COMPLETAS</div>
                            <div className="text-4xl font-bold text-red-600 mt-2">
                                {clases.filter(c => c.completa).length}
                            </div>
                        </div>
                    </div>

                    {/* Lista de clases */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Mis Clases</h3>
                        </div>

                        {clases.length > 0 ? (
                            <div className="divide-y">
                                {clases.map((clase) => (
                                    <div
                                        key={clase.id}
                                        className="p-6 hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => router.visit(route('panel.clases.show', clase.id))}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900">{clase.nombre}</h4>
                                                <p className="text-sm text-gray-600">
                                                    📅 {new Date(clase.fecha).toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    ⏰ {clase.hora_inicio} - {clase.hora_fin}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className={`text-3xl font-bold ${
                                                    clase.completa ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {clase.inscritos}/{clase.capacidad}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">inscritos</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 p-3 rounded">
                                                <p className="text-xs text-gray-600">Espacios</p>
                                                <p className="text-lg font-bold text-blue-600">
                                                    {Math.max(0, clase.capacidad - clase.inscritos)}
                                                </p>
                                            </div>
                                            <div className={`${clase.lista_espera_count > 0 ? 'bg-amber-50' : 'bg-gray-50'} p-3 rounded`}>
                                                <p className="text-xs text-gray-600">Lista de Espera</p>
                                                <p className={`text-lg font-bold ${clase.lista_espera_count > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                                                    {clase.lista_espera_count} {clase.lista_espera_count === 1 ? 'persona' : 'personas'}
                                                </p>
                                            </div>
                                        </div>

                                        {clase.descripcion && (
                                            <p className="text-sm text-gray-600 mt-3 italic">{clase.descripcion}</p>
                                        )}

                                        <div className="mt-4">
                                            <Link
                                                href={route('panel.clases.show', clase.id)}
                                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Ver Detalles
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-gray-500 text-lg">No tienes clases programadas este mes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
