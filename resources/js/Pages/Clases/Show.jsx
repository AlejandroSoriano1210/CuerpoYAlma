import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ClasesShow({ horario }) {
    const { auth } = usePage().props;
    const [isReservando, setIsReservando] = useState(false);
    const [isCancelando, setIsCancelando] = useState(false);

    // preferimos usar el flag 'reservado' enviado por el controlador (considera reservas pendientes)
    const yaInscrito = horario.reservado === true;
    const enListaEspera = horario.en_lista_espera === true;

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

    const handleCancelarReserva = () => {
        if (!horario.reserva_id) {
            alert('Reserva no encontrada.');
            return;
        }

        if (confirm('¿Deseas cancelar tu reserva en esta clase?')) {
            setIsCancelando(true);

            router.patch(route('reservas.cancelar', horario.reserva_id), {}, {
                onSuccess: () => setIsCancelando(false),
                onError: () => {
                    setIsCancelando(false);
                    alert('Error al cancelar la reserva');
                },
            });
        }
    };

    const handleCancelarListaEspera = () => {
        if (!horario.lista_espera_id) {
            alert('No estás en la lista de espera.');
            return;
        }

        if (confirm('¿Deseas cancelar tu lugar en la lista de espera?')) {
            setIsCancelando(true);

            router.patch(route('lista-espera.cancelar', horario.lista_espera_id), {}, {
                onSuccess: () => setIsCancelando(false),
                onError: () => {
                    setIsCancelando(false);
                    alert('Error al cancelar');
                },
            });
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

                        {/* Botón de reserva - Clase con espacios */}
                        {!horario.completa && !yaInscrito && !enListaEspera && (
                            <button
                                onClick={handleReserva}
                                disabled={isReservando}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg"
                            >
                                {isReservando ? 'Reservando...' : 'Reservar Lugar'}
                            </button>
                        )}

                        {/* Ya inscrito en la clase */}
                        {yaInscrito && (
                            <div className="space-y-2">
                                <div className="w-full bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded text-lg font-bold text-center">
                                    ✓ Ya estás inscrito en esta clase
                                </div>

                                <button
                                    onClick={handleCancelarReserva}
                                    disabled={isCancelando}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg"
                                >
                                    {isCancelando ? 'Cancelando...' : 'Cancelar Reserva'}
                                </button>
                            </div>
                        )}

                        {/* Clase completa - Sin reserva, Sin lista de espera */}
                        {horario.completa && !yaInscrito && !enListaEspera && (
                            <button
                                onClick={handleReserva}
                                disabled={isReservando}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg"
                            >
                                {isReservando ? 'Procesando...' : '⏳ Unirse a Lista de Espera'}
                            </button>
                        )}

                        {/* En lista de espera */}
                        {enListaEspera && !yaInscrito && (
                            <div className="space-y-2">
                                <div className="w-full bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded text-lg font-bold text-center">
                                    ⏳ Posición {horario.posicion_lista_espera} de {horario.lista_espera_count} en lista de espera
                                </div>

                                <button
                                    onClick={handleCancelarListaEspera}
                                    disabled={isCancelando}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded text-lg"
                                >
                                    {isCancelando ? 'Cancelando...' : 'Cancelar de Lista de Espera'}
                                </button>
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
