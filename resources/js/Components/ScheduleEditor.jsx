import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DIAS_SEMANA_DEFAULT = [
    { id: 0, nombre: 'Lunes' },
    { id: 1, nombre: 'Martes' },
    { id: 2, nombre: 'Miércoles' },
    { id: 3, nombre: 'Jueves' },
    { id: 4, nombre: 'Viernes' },
    { id: 5, nombre: 'Sábado' },
];

/**
 * Calcula el total de horas de los horarios
 */
const calcularTotalHoras = (horarios) => {
    let total = 0;
    Object.values(horarios).forEach((bloques) => {
        bloques.forEach((bloque) => {
            if (bloque.hora_inicio && bloque.hora_fin) {
                const inicio = bloque.hora_inicio.split(':');
                const fin = bloque.hora_fin.split(':');
                const inicioMinutos = parseInt(inicio[0]) * 60 + parseInt(inicio[1]);
                const finMinutos = parseInt(fin[0]) * 60 + parseInt(fin[1]);
                const diferencia = Math.max(0, finMinutos - inicioMinutos);
                total += diferencia / 60;
            }
        });
    });
    return total;
};

/**
 * ScheduleEditor - Editor de horarios por día de la semana
 *
 * @param {object} value - Valor actual: { [diaSemana]: [{ id, hora_inicio, hora_fin }] }
 * @param {function} onChange - Callback cuando cambian los horarios
 * @param {number} maxHours - Máximo de horas (default: 40)
 * @param {Array} dias - Días de la semana a mostrar
 * @param {string} error - Mensaje de error
 */
export default function ScheduleEditor({
    value = {},
    onChange,
    maxHours = 40,
    dias = DIAS_SEMANA_DEFAULT,
    error,
}) {
    // Inicializar horarios por día
    const initializeHorarios = () => {
        const initial = {};
        dias.forEach((dia) => {
            initial[dia.id] = value[dia.id] || [];
        });
        return initial;
    };

    const [horariosPorDia, setHorariosPorDia] = useState(initializeHorarios);
    const [totalHoras, setTotalHoras] = useState(calcularTotalHoras(value));

    // Actualizar cuando cambie el value externo
    useEffect(() => {
        const newHorarios = initializeHorarios();
        setHorariosPorDia(newHorarios);
        setTotalHoras(calcularTotalHoras(newHorarios));
    }, [value]);

    const notifyChange = (nuevosHorarios) => {
        if (onChange) {
            // Convertir a formato array para el formulario
            const horariosArray = [];
            Object.entries(nuevosHorarios).forEach(([dia, bloques]) => {
                bloques.forEach((bloque) => {
                    horariosArray.push({
                        dia_semana: parseInt(dia),
                        hora_inicio: bloque.hora_inicio,
                        hora_fin: bloque.hora_fin,
                    });
                });
            });
            onChange(horariosArray);
        }
    };

    const handleAddBloque = (dia) => {
        const nuevosHorarios = { ...horariosPorDia };
        nuevosHorarios[dia] = [
            ...nuevosHorarios[dia],
            { id: Date.now(), hora_inicio: '09:00', hora_fin: '13:00' },
        ];
        setHorariosPorDia(nuevosHorarios);
        setTotalHoras(calcularTotalHoras(nuevosHorarios));
        notifyChange(nuevosHorarios);
    };

    const handleRemoveBloque = (dia, id) => {
        const nuevosHorarios = { ...horariosPorDia };
        nuevosHorarios[dia] = nuevosHorarios[dia].filter((b) => b.id !== id);
        setHorariosPorDia(nuevosHorarios);
        setTotalHoras(calcularTotalHoras(nuevosHorarios));
        notifyChange(nuevosHorarios);
    };

    const handleActualizarBloque = (dia, id, field, value) => {
        const nuevosHorarios = { ...horariosPorDia };
        nuevosHorarios[dia] = nuevosHorarios[dia].map((b) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        setHorariosPorDia(nuevosHorarios);
        setTotalHoras(calcularTotalHoras(nuevosHorarios));
        notifyChange(nuevosHorarios);
    };

    const exceedsMaxHours = totalHoras > maxHours;

    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    Horario de Trabajo
                </h2>
                <div
                    className={`text-sm font-semibold px-3 py-1 rounded ${
                        exceedsMaxHours
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                >
                    {totalHoras.toFixed(2)} / {maxHours} horas
                </div>
            </div>

            {exceedsMaxHours && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    <AlertTriangle className="w-4 h-4 inline" /> El total de horas ({totalHoras.toFixed(2)}) supera el máximo permitido de {maxHours} horas.
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {dias.map((dia) => (
                    <div
                        key={dia.id}
                        className="p-4 bg-white rounded border border-gray-200"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-gray-900">
                                {dia.nombre}
                            </h3>
                            <button
                                type="button"
                                onClick={() => handleAddBloque(dia.id)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                            >
                                + Agregar bloque
                            </button>
                        </div>

                        {horariosPorDia[dia.id]?.length > 0 ? (
                            <div className="space-y-2">
                                {horariosPorDia[dia.id].map((bloque) => (
                                    <div
                                        key={bloque.id}
                                        className="flex gap-2 items-end bg-gray-50 p-3 rounded"
                                    >
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Inicio
                                            </label>
                                            <input
                                                type="time"
                                                value={bloque.hora_inicio}
                                                onChange={(e) =>
                                                    handleActualizarBloque(
                                                        dia.id,
                                                        bloque.id,
                                                        'hora_inicio',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Fin
                                            </label>
                                            <input
                                                type="time"
                                                value={bloque.hora_fin}
                                                onChange={(e) =>
                                                    handleActualizarBloque(
                                                        dia.id,
                                                        bloque.id,
                                                        'hora_fin',
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveBloque(dia.id, bloque.id)
                                            }
                                            className="text-red-600 hover:text-red-900 font-medium text-sm px-3 py-2"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Sin horario</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Exportar también la función de cálculo por si se necesita externamente
export { calcularTotalHoras };
