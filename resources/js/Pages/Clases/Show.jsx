import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BackLink, InfoGrid, ReservationStatus } from '@/Components';
import { formatDate } from '@/Utils/formatDate';
import { CalendarDays, Clock, Users } from 'lucide-react';

export default function ClasesShow({ horario }) {
    const { auth } = usePage().props;
    const [isReservando, setIsReservando] = useState(false);
    const [isCancelando, setIsCancelando] = useState(false);

    // preferimos usar el flag 'reservado' enviado por el controlador (considera reservas pendientes)
    const yaInscrito = horario.reservado === true;

    // Determinar el status para ReservationStatus
    const getReservationStatus = () => {
        if (yaInscrito) return 'inscrito';
        if (enListaEspera) return 'lista_espera';
        if (horario.completa) return 'completa';
        return 'disponible';
    };

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

    const infoItems = [
        {
            label: 'Fecha',
            icon: <CalendarDays className="w-5 h-5" />,
            value: formatDate(horario.fecha, 'long'),
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Horario',
            icon: <Clock className="w-5 h-5" />,
            value: `${horario.hora_inicio} - ${horario.hora_fin}`,
            bgColor: 'bg-green-50',
        },
        {
            label: 'Inscritos',
            icon: <Users className="w-5 h-5" />,
            value: `${horario.inscritos} / ${horario.capacidad}`,
            bgColor: horario.completa ? 'bg-red-50' : 'bg-green-50',
        },
        {
            label: 'Estado',
            value: horario.completa ? 'Completa' : 'Disponible',
            bgColor: horario.completa ? 'bg-red-50' : 'bg-green-50',
            valueColor: horario.completa ? 'text-red-600' : 'text-green-600',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={horario.nombre} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow p-8">
                        <BackLink href={route('clases.index')} text="Volver al calendario" />

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {horario.nombre_clase}
                        </h1>

                        {horario.tipo_clase && (
                            <p className="text-lg text-gray-600 mb-4">
                                Tipo: <span className="font-bold text-gray-900">{horario.tipo_clase}</span>
                            </p>
                        )}

                        <div className="mb-6 pb-6 border-b">
                            <p className="text-lg text-gray-600">
                                Entrenador: <span className="font-bold text-gray-900">{horario.entrenador}</span>
                            </p>
                        </div>

                        <div className="mb-8">
                            <InfoGrid
                                items={infoItems}
                                columns={2}
                                variant="card"
                                gap="lg"
                            />
                        </div>

                        <ReservationStatus
                            status={getReservationStatus()}
                            posicionListaEspera={horario.posicion_lista_espera}
                            totalListaEspera={horario.lista_espera_count}
                            onReservar={handleReserva}
                            onCancelar={yaInscrito ? handleCancelarReserva : handleCancelarListaEspera}
                            loading={isReservando || isCancelando}
                            loadingAction={isReservando ? 'reservar' : 'cancelar'}
                        />

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
