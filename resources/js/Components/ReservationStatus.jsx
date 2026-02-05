import React from 'react';
import ActionButton from './ActionButton';

/**
 * ReservationStatus - Componente para mostrar el estado de reserva y acciones
 *
 * @param {string} status - Estado: "inscrito" | "lista_espera" | "disponible" | "completa"
 * @param {number} posicionListaEspera - Posición en lista de espera
 * @param {number} totalListaEspera - Total en lista de espera
 * @param {function} onReservar - Callback para reservar
 * @param {function} onCancelar - Callback para cancelar
 * @param {function} onUnirseListaEspera - Callback para unirse a lista de espera
 * @param {boolean} loading - Si está procesando
 * @param {string} loadingAction - Qué acción está en proceso: "reservar" | "cancelar"
 */
export default function ReservationStatus({
    status,
    posicionListaEspera,
    totalListaEspera,
    onReservar,
    onCancelar,
    onUnirseListaEspera,
    loading = false,
    loadingAction,
}) {
    // Ya inscrito
    if (status === 'inscrito') {
        return (
            <div className="space-y-2">
                <div className="w-full bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded text-lg font-bold text-center">
                    ✓ Ya estás inscrito en esta clase
                </div>
                {onCancelar && (
                    <ActionButton
                        onClick={onCancelar}
                        loading={loading && loadingAction === 'cancelar'}
                        loadingText="Cancelando..."
                        variant="danger"
                        fullWidth
                        size="lg"
                    >
                        Cancelar Reserva
                    </ActionButton>
                )}
            </div>
        );
    }

    // En lista de espera
    if (status === 'lista_espera') {
        return (
            <div className="space-y-2">
                <div className="w-full bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded text-lg font-bold text-center">
                    ⏳ Posición {posicionListaEspera} de {totalListaEspera} en lista de espera
                </div>
                {onCancelar && (
                    <ActionButton
                        onClick={onCancelar}
                        loading={loading && loadingAction === 'cancelar'}
                        loadingText="Cancelando..."
                        variant="danger"
                        fullWidth
                        size="lg"
                    >
                        Cancelar de Lista de Espera
                    </ActionButton>
                )}
            </div>
        );
    }

    // Clase completa - puede unirse a lista de espera
    if (status === 'completa') {
        return (
            <ActionButton
                onClick={onUnirseListaEspera || onReservar}
                loading={loading && loadingAction === 'reservar'}
                loadingText="Procesando..."
                variant="warning"
                fullWidth
                size="lg"
            >
                ⏳ Unirse a Lista de Espera
            </ActionButton>
        );
    }

    // Disponible para reservar
    if (status === 'disponible') {
        return (
            <ActionButton
                onClick={onReservar}
                loading={loading && loadingAction === 'reservar'}
                loadingText="Reservando..."
                variant="primary"
                fullWidth
                size="lg"
            >
                Reservar Lugar
            </ActionButton>
        );
    }

    return null;
}
