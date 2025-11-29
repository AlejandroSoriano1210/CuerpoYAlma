import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ClasesShow({ horario }) {
    const { auth } = usePage().props;
    const [isReservando, setIsReservando] = useState(false);

    const yaInscrito = horario.clientes?.some(c => c.id === auth.user.id);

    const handleReserva = () => {
        if (confirm('¿Deseas reservar un lugar en esta clase?')) {
            setIsReservando(true);

            router.post(route('reservas.store'),
                { horario_clase_id: horario.id },
                {
                    onSuccess: () => {
                        setIsReservando(false);
                    },
                    onError: () => {
                        setIsReservando(false);
                        alert('Error al realizar la reserva');
                    },
                }
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={horario.nombre} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow p-8">
                        <Link
                            href={route('clases.index')}
                            className="text-blue-600 hover:text-blue-900 mb-6 inline-block"
                        >
                            ← Volver al calendario
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {horario.nombre}
                        </h1>

                        <div className="mb-6 pb-6 border-b">
                            <p className="text-lg text-gray-600">
                                Entrenador: <span className="font-bold text-gray-900">{horario.entrenador}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">📅 Fecha</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Date(horario.fecha).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="bg-green-50 p-6 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">⏰ Horario</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {horario.hora_inicio} - {horario.hora_fin}
                                </p>
                            </div>

                            <div className={`p-6 rounded-lg ${horario.completa ? 'bg-red-50' : 'bg-green-50'}`}>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">👥 Inscritos</h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {horario.inscritos} / {horario.capacidad}
                                </p>
                            </div>

                            <div className={`p-6 rounded-lg ${horario.completa ? 'bg-red-50' : 'bg-green-50'}`}>
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Estado</h3>
                                <p className={`text-2xl font-bold ${horario.completa ? 'text-red-600' : 'text-green-600'}`}>
                                    {horario.completa ? 'Completa' : 'Disponible'}
                                </p>
                            </div>
                        </div>

                        {/* Botón de reserva */}
                        {!horario.completa && !yaInscrito && (
                            <button
                                onClick={handleReserva}
                                disabled={isReservando}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg"
                            >
                                {isReservando ? 'Reservando...' : 'Reservar Lugar'}
                            </button>
                        )}

                        {yaInscrito && (
                            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded text-lg font-bold text-center">
                                ✓ Ya estás inscrito en esta clase
                            </div>
                        )}

                        {horario.completa && !yaInscrito && (
                            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded text-lg font-bold text-center">
                                Esta clase está completa
                            </div>
                        )}

                        {/* Lista de inscritos */}
                        {horario.clientes && horario.clientes.length > 0 && (
                            <div className="mt-8 pt-8 border-t">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Inscritos</h2>
                                <div className="space-y-2">
                                    {horario.clientes.map((cliente) => (
                                        <div key={cliente.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-bold text-gray-900">{cliente.name}</p>
                                                <p className="text-sm text-gray-600">{cliente.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
