import React, { useState, useEffect } from 'react';

/**
 * EjercicioSelector - Selector de ejercicios para guías con series/repeticiones
 *
 * @param {Array} ejercicios - Lista de ejercicios disponibles: [{ id, nombre, descripcion }]
 * @param {Array} value - Ejercicios seleccionados: [{ ejercicio_id, nombre, series, repeticiones, instrucciones }]
 * @param {function} onChange - Callback cuando cambian los ejercicios
 */
export default function EjercicioSelector({
    ejercicios = [],
    value = [],
    onChange,
}) {
    const [ejerciciosList, setEjerciciosList] = useState(value);
    const [selectedEjercicio, setSelectedEjercicio] = useState(ejercicios?.[0]?.id ?? null);
    const [series, setSeries] = useState(3);
    const [repeticiones, setRepeticiones] = useState(10);
    const [instrucciones, setInstrucciones] = useState('');

    // Inicializar instrucciones con la descripción del primer ejercicio
    useEffect(() => {
        if (ejercicios && ejercicios.length > 0 && ejercicios[0]?.descripcion) {
            setInstrucciones(ejercicios[0].descripcion);
        }
    }, []);

    // Sincronizar con value externo
    useEffect(() => {
        setEjerciciosList(value);
    }, [value]);

    const handleEjercicioChange = (e) => {
        const id = e.target.value;
        setSelectedEjercicio(id);
        const ejercicio = ejercicios.find(ej => ej.id === Number(id));
        if (ejercicio?.descripcion) {
            setInstrucciones(ejercicio.descripcion);
        } else {
            setInstrucciones('');
        }
    };

    const addEjercicio = () => {
        if (!selectedEjercicio) return;

        const ejercicio = ejercicios.find(e => e.id === Number(selectedEjercicio));
        if (!ejercicio) return;

        const nuevoEjercicio = {
            ejercicio_id: ejercicio.id,
            nombre: ejercicio.nombre,
            series: Number(series) || null,
            repeticiones: Number(repeticiones) || null,
            instrucciones: instrucciones || null,
        };

        const nuevaLista = [...ejerciciosList, nuevoEjercicio];
        setEjerciciosList(nuevaLista);

        if (onChange) {
            onChange(nuevaLista);
        }

        // Reset fields
        setSeries(3);
        setRepeticiones(10);
        setInstrucciones('');
    };

    const removeEjercicio = (index) => {
        const nuevaLista = ejerciciosList.filter((_, i) => i !== index);
        setEjerciciosList(nuevaLista);

        if (onChange) {
            onChange(nuevaLista);
        }
    };

    const moveEjercicio = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= ejerciciosList.length) return;

        const nuevaLista = [...ejerciciosList];
        [nuevaLista[index], nuevaLista[newIndex]] = [nuevaLista[newIndex], nuevaLista[index]];
        setEjerciciosList(nuevaLista);

        if (onChange) {
            onChange(nuevaLista);
        }
    };

    if (!ejercicios || ejercicios.length === 0) {
        return (
            <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-3">Ejercicios</h3>
                <p className="text-gray-500 text-sm">No hay ejercicios disponibles.</p>
            </div>
        );
    }

    return (
        <div className="mb-6 border p-4 rounded-lg bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-3">Ejercicios</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <select
                    value={selectedEjercicio || ''}
                    onChange={handleEjercicioChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {ejercicios.map((ej) => (
                        <option key={ej.id} value={ej.id}>
                            {ej.nombre}
                        </option>
                    ))}
                </select>

                <div className="flex gap-2">
                    <input
                        type="number"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder="Series"
                    />
                    <input
                        type="number"
                        value={repeticiones}
                        onChange={(e) => setRepeticiones(e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder="Reps"
                    />
                </div>
            </div>

            <div className="mb-4">
                <textarea
                    value={instrucciones}
                    onChange={(e) => setInstrucciones(e.target.value)}
                    placeholder="Instrucciones (opcional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                />
            </div>

            <div className="mb-4">
                <button
                    type="button"
                    onClick={addEjercicio}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                >
                    Añadir ejercicio
                </button>
            </div>

            {ejerciciosList.length > 0 && (
                <div className="mt-4 space-y-2">
                    {ejerciciosList.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm font-medium">
                                        #{index + 1}
                                    </span>
                                    <p className="font-bold text-gray-900">{item.nombre}</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {item.series} series × {item.repeticiones} repeticiones
                                </p>
                                {item.instrucciones && (
                                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                                        {item.instrucciones}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => moveEjercicio(index, -1)}
                                    disabled={index === 0}
                                    className="text-gray-500 hover:text-gray-700 disabled:opacity-30 px-1"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveEjercicio(index, 1)}
                                    disabled={index === ejerciciosList.length - 1}
                                    className="text-gray-500 hover:text-gray-700 disabled:opacity-30 px-1"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeEjercicio(index)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm ml-2"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
