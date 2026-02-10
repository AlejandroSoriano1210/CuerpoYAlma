import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { validarRequerido } from '@/Utils/validations';

export default function MaquinaCreateModal({ isOpen, onClose, onSuccess }) {
    const { data, setData, post, errors, processing, reset } = useForm({
        nombre: '',
        descripcion: '',
        ubicacion: '',
        estado: 'operativa',
        imagen: null,
    });

    const [touched, setTouched] = useState({
        nombre: false,
        ubicacion: false,
    });

    const nombreError = validarRequerido(data.nombre, 'Nombre');
    const ubicacionError = validarRequerido(data.ubicacion, 'Ubicación');

    const handleClose = () => {
        reset();
        setTouched({ nombre: false, ubicacion: false });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('maquinas.store'), {
            forceFormData: true,
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
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Máquina</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                onBlur={() => setTouched({ ...touched, nombre: true })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    touched.nombre && nombreError !== true
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Ej: Prensa de Pecho"
                            />
                            {touched.nombre && nombreError !== true && (
                                <p className="text-red-500 text-sm mt-1">{nombreError}</p>
                            )}
                        </div>

                        {/* Ubicación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ubicación
                            </label>
                            <input
                                type="text"
                                value={data.ubicacion}
                                onChange={(e) => setData('ubicacion', e.target.value)}
                                onBlur={() => setTouched({ ...touched, ubicacion: true })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    touched.ubicacion && ubicacionError !== true
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300'
                                }`}
                                placeholder="Ej: Sala 1"
                            />
                            {touched.ubicacion && ubicacionError !== true && (
                                <p className="text-red-500 text-sm mt-1">{ubicacionError}</p>
                            )}
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado
                            </label>
                            <select
                                value={data.estado}
                                onChange={(e) => setData('estado', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="operativa">Operativa</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="fuera_de_servicio">Fuera de servicio</option>
                            </select>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción (opcional)
                            </label>
                            <textarea
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="4"
                                placeholder="Detalles sobre la máquina..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Foto (opcional)
                            </label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) => setData('imagen', e.target.files?.[0] || null)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    errors.imagen ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.imagen && <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>}
                            {data.imagen && (
                                <img
                                    src={URL.createObjectURL(data.imagen)}
                                    alt="Vista previa"
                                    className="mt-3 h-40 w-full rounded-lg object-cover"
                                />
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                            >
                                {processing ? 'Guardando...' : 'Crear Máquina'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
