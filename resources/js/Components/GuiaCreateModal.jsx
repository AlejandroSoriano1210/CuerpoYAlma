import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { validarRequerido } from '@/Utils/validations';

export default function GuiaCreateModal({ isOpen, onClose, onSuccess, ejercicios }) {
    const { data, setData, errors, processing, reset } = useForm({
        titulo: '',
        nivel: 'principiante',
        contenido: '',
        ejercicios: [],
    });

    const [ejerciciosList, setEjerciciosList] = useState([]);
    const [selectedEjercicio, setSelectedEjercicio] = useState(ejercicios?.[0]?.id ?? null);
    const [series, setSeries] = useState(3);
    const [repeticiones, setRepeticiones] = useState(10);
    const [instrucciones, setInstrucciones] = useState('');
    const [touched, setTouched] = useState({
        titulo: false,
        ejercicios: false,
    });
    const [validationError, setValidationError] = useState('');

    const tituloError = validarRequerido(data.titulo, 'Título');
    const ejerciciosError = ejerciciosList.length === 0 ? 'Debes agregar al menos un ejercicio a la guía' : true;

    useEffect(() => {
        if (ejercicios && ejercicios.length > 0 && ejercicios[0]?.descripcion) {
            setInstrucciones(ejercicios[0].descripcion);
        }
    }, [ejercicios]);

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
        setEjerciciosList(prev => [
            ...prev,
            {
                ejercicio_id: ejercicio.id,
                nombre: ejercicio.nombre,
                series: Number(series) || null,
                repeticiones: Number(repeticiones) || null,
                instrucciones: instrucciones || null,
            },
        ]);

        setSeries(3);
        setRepeticiones(10);
        setInstrucciones('');
    };

    const handleClose = () => {
        reset();
        setEjerciciosList([]);
        setSeries(3);
        setRepeticiones(10);
        setInstrucciones('');
        setTouched({ titulo: false, ejercicios: false });
        setValidationError('');
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar título
        if (tituloError !== true) {
            setValidationError(tituloError);
            setTouched({ ...touched, titulo: true });
            return;
        }

        // Validar que haya al menos un ejercicio
        if (ejerciciosError !== true) {
            setValidationError(ejerciciosError);
            setTouched({ ...touched, ejercicios: true });
            return;
        }

        setValidationError('');

        const formData = {
            titulo: data.titulo,
            nivel: data.nivel,
            contenido: data.contenido,
            ejercicios: ejerciciosList,
        };
        router.post(route('guias.store'), formData, {
            onSuccess: () => {
                handleClose();
                onSuccess?.();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Guía</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                            <input
                                type="text"
                                value={data.titulo}
                                onChange={(e) => setData('titulo', e.target.value)}
                                onBlur={() => setTouched({ ...touched, titulo: true })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    touched.titulo && tituloError !== true
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Ej: Rutina de Pecho"
                            />
                            {touched.titulo && tituloError !== true && (
                                <p className="text-red-500 text-sm mt-1">{tituloError}</p>
                            )}
                        </div>

                        {/* Nivel */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                            <select
                                value={data.nivel}
                                onChange={(e) => setData('nivel', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    errors.nivel ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="principiante">Principiante</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                            {errors.nivel && <p className="text-red-500 text-sm mt-1">{errors.nivel}</p>}
                        </div>

                        {/* Contenido */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contenido (opcional)</label>
                            <textarea
                                value={data.contenido}
                                onChange={(e) => setData('contenido', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="3"
                                placeholder="Descripción general de la guía..."
                            />
                        </div>

                        {/* Agregar Ejercicios */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Ejercicios</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ejercicio</label>
                                    <select
                                        value={selectedEjercicio}
                                        onChange={handleEjercicioChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {ejercicios?.map((ej) => (
                                            <option key={ej.id} value={ej.id}>
                                                {ej.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
                                        <input
                                            type="number"
                                            value={series}
                                            onChange={(e) => setSeries(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Repeticiones</label>
                                        <input
                                            type="number"
                                            value={repeticiones}
                                            onChange={(e) => setRepeticiones(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instrucciones (opcional)</label>
                                <textarea
                                    value={instrucciones}
                                    onChange={(e) => setInstrucciones(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows="3"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={addEjercicio}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition"
                            >
                                Añadir ejercicio
                            </button>

                            {touched.ejercicios && ejerciciosError !== true && (
                                <p className="text-red-500 text-sm mt-2">{ejerciciosError}</p>
                            )}

                            {ejerciciosList.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {ejerciciosList.map((item, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900">{item.nombre}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.series} series × {item.repeticiones} repeticiones
                                                </p>
                                                {item.instrucciones && (
                                                    <p className="text-sm text-gray-700 mt-1">{item.instrucciones}</p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEjerciciosList(prev =>
                                                        prev.filter((_, i) => i !== index)
                                                    )
                                                }
                                                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                            {validationError && (
                                <p className="text-red-500 text-sm flex-1">{validationError}</p>
                            )}
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing || (touched.titulo && tituloError !== true) || ejerciciosList.length === 0}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                            >
                                {processing ? 'Guardando...' : 'Crear Guía'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
