import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import Calendario from '@/Components/Calendario';

export default function ClasesIndex({ horarios, calendario, mes, ano, mesNombre }) {
    const { hasRole } = usaRoleUser();
    const { flash } = usePage().props;
    const [selectedDate, setSelectedDate] = useState(null);

    // Obtener clases para una fecha específica
    const clasesDelDia = selectedDate
        ? horarios.filter(h => h.fecha === selectedDate)
        : [];

    return (
        <AuthenticatedLayout>
            <Head title="Clases" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Calendario de Clases - {mesNombre} {ano}
                        </h1>

                        {hasRole('entrenador') && (
                            <Link
                                href={route('clases.horario.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                + Crear Clase
                            </Link>
                        )}
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Calendario */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                            <Calendario
                                mes={mes}
                                ano={ano}
                                horarios={horarios}
                                onSelectDate={setSelectedDate}
                                selectedDate={selectedDate}
                            />
                        </div>

                        {/* Panel lateral con clases del día */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Selecciona una fecha'}
                            </h2>

                            <div className="space-y-4">
                                {clasesDelDia.length > 0 ? (
                                    clasesDelDia.map((clase) => (
                                        <div
                                            key={clase.id}
                                            className={`p-4 rounded-lg border-2 ${
                                                clase.completa
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-green-300 bg-green-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        {clase.nombre_clase}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Entrenador: {clase.entrenador}
                                                    </p>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                    clase.completa
                                                        ? 'bg-red-200 text-red-800'
                                                        : 'bg-green-200 text-green-800'
                                                }`}>
                                                    {clase.completa ? 'Completa' : 'Disponible'}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-3">
                                                <p>{clase.hora_inicio} - {clase.hora_fin}</p>
                                                <p>{clase.inscritos}/{clase.capacidad} inscritos</p>
                                            </div>

                                            <Link
                                                href={route('clases.show', clase.id)}
                                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                                            >
                                                Ver Detalles
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay clases en esta fecha
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
