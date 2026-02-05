import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Wrench } from 'lucide-react';

export default function MaquinaReporteModal({ isOpen, onClose, onSuccess, maquina, estadoAnterior }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        tiempo_reparacion: '',
        unidad_tiempo: 'horas',
        coste_reparacion: '',
        notas: '',
        estado_anterior: '',
    });

    const [touched, setTouched] = useState({
        tiempo_reparacion: false,
        coste_reparacion: false,
    });

    // Actualizar estado_anterior cuando cambie
    useEffect(() => {
        if (estadoAnterior) {
            setData('estado_anterior', estadoAnterior);
        }
    }, [estadoAnterior]);

    const handleClose = () => {
        reset();
        setTouched({ tiempo_reparacion: false, coste_reparacion: false });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.tiempo_reparacion || data.tiempo_reparacion <= 0) {
            setTouched(prev => ({ ...prev, tiempo_reparacion: true }));
            return;
        }

        if (!data.coste_reparacion || data.coste_reparacion < 0) {
            setTouched(prev => ({ ...prev, coste_reparacion: true }));
            return;
        }

        post(route('maquinas.reporte', maquina.id), {
            onSuccess: () => {
                handleClose();
                onSuccess?.();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Wrench className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Informe de Reparación</h2>
                            <p className="text-sm text-gray-500">{maquina?.nombre}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            La máquina pasó de <span className="font-semibold">{estadoAnterior?.replaceAll('_', ' ')}</span> a <span className="font-semibold text-green-600">operativa</span>.
                            Por favor, completa el informe de reparación.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tiempo de reparación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiempo de reparación
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    value={data.tiempo_reparacion}
                                    onChange={(e) => setData('tiempo_reparacion', e.target.value)}
                                    onBlur={() => setTouched({ ...touched, tiempo_reparacion: true })}
                                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        touched.tiempo_reparacion && (!data.tiempo_reparacion || data.tiempo_reparacion <= 0)
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Ej: 2"
                                />
                                <select
                                    value={data.unidad_tiempo}
                                    onChange={(e) => setData('unidad_tiempo', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="minutos">Minutos</option>
                                    <option value="horas">Horas</option>
                                    <option value="dias">Días</option>
                                </select>
                            </div>
                            {touched.tiempo_reparacion && (!data.tiempo_reparacion || data.tiempo_reparacion <= 0) && (
                                <p className="text-red-500 text-sm mt-1">El tiempo de reparación es obligatorio</p>
                            )}
                            {errors.tiempo_reparacion && (
                                <p className="text-red-500 text-sm mt-1">{errors.tiempo_reparacion}</p>
                            )}
                        </div>

                        {/* Coste de reparación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coste de reparación (€)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.coste_reparacion}
                                onChange={(e) => setData('coste_reparacion', e.target.value)}
                                onBlur={() => setTouched({ ...touched, coste_reparacion: true })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    touched.coste_reparacion && (!data.coste_reparacion || data.coste_reparacion < 0)
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Ej: 150.00"
                            />
                            {touched.coste_reparacion && (!data.coste_reparacion || data.coste_reparacion < 0) && (
                                <p className="text-red-500 text-sm mt-1">El coste de reparación es obligatorio</p>
                            )}
                            {errors.coste_reparacion && (
                                <p className="text-red-500 text-sm mt-1">{errors.coste_reparacion}</p>
                            )}
                        </div>

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas adicionales (opcional)
                            </label>
                            <textarea
                                value={data.notas}
                                onChange={(e) => setData('notas', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="3"
                                placeholder="Describe el problema encontrado y la solución aplicada..."
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                            >
                                {processing ? 'Guardando...' : 'Guardar Informe'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
