import React, { useMemo } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ entrenadores }) {
    const { flash } = usePage().props;
    const { data, setData, post, errors, processing } = useForm({
        nombre: '',
        capacidad: 10,
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        descripcion: '',
        user_id: entrenadores?.[0]?.id ?? null,
        semanal: false,
    });

    // Obtener el entrenador seleccionado
    const entrenadorSeleccionado = useMemo(() => {
        if (!data.user_id || !entrenadores) return null;
        return entrenadores.find(et => et.id == data.user_id);
    }, [data.user_id, entrenadores]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('clases.store'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Clase" />

            <div className="py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Crear Nueva Clase</h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {flash.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Nombre */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Clase
                                </label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Clase con Juan, Yoga Matutino, etc."
                                />
                                {errors.nombre && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                )}
                            </div>

                            {/* Capacidad */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacidad
                                </label>
                                <input
                                    type="number"
                                    value={data.capacidad}
                                    onChange={(e) => setData('capacidad', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.capacidad ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    min="1"
                                    max="50"
                                />
                                {errors.capacidad && (
                                    <p className="text-red-500 text-sm mt-1">{errors.capacidad}</p>
                                )}
                            </div>

                            {/* Fecha */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={data.fecha}
                                    onChange={(e) => setData('fecha', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.fecha ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.fecha && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
                                )}
                            </div>

                            {/* Hora Inicio */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hora Inicio
                                </label>
                                <input
                                    type="time"
                                    value={data.hora_inicio}
                                    onChange={(e) => setData('hora_inicio', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.hora_inicio ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.hora_inicio && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hora_inicio}</p>
                                )}
                            </div>

                            {/* Hora Fin */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hora Fin
                                </label>
                                <input
                                    type="time"
                                    value={data.hora_fin}
                                    onChange={(e) => setData('hora_fin', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.hora_fin ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.hora_fin && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hora_fin}</p>
                                )}
                            </div>

                            {/* Descripción (opcional) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Detalles sobre la clase..."
                                    rows="3"
                                />
                            </div>

                            {/* Clase semanal */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={data.semanal}
                                        onChange={(e) => setData('semanal', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Crear clase semanal (se replicará todas las semanas del mes)
                                    </span>
                                </label>
                                {data.semanal && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Se crearán clases cada semana en el mismo día y hora hasta final de mes
                                    </p>
                                )}
                            </div>

                            {/* Si es superusuario: elegir entrenador asignado */}
                            {entrenadores && entrenadores.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Entrenador</label>
                                    <select
                                        value={data.user_id}
                                        onChange={(e) => setData('user_id', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.user_id ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {entrenadores.map((et) => (
                                            <option key={et.id} value={et.id}>{et.name}</option>
                                        ))}
                                    </select>
                                    {errors.user_id && <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>}

                                    {/* Mostrar horario del entrenador seleccionado */}
                                    {entrenadorSeleccionado && entrenadorSeleccionado.horarios.length > 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                📅 Horario de {entrenadorSeleccionado.name}
                                            </h3>
                                            <div className="space-y-2">
                                                {entrenadorSeleccionado.horarios.map((horario, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm text-gray-700 bg-white px-3 py-2 rounded">
                                                        <span className="font-medium">{horario.dia}:</span>
                                                        <span className="text-gray-600">{horario.horarios}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {entrenadorSeleccionado && entrenadorSeleccionado.horarios.length === 0 && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Este entrenador no tiene horario de trabajo asignado
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Errores de validación */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <p className="font-bold">Hay errores en el formulario:</p>
                                    <ul className="list-disc list-inside mt-2">
                                        {Object.entries(errors).map(([key, value]) => (
                                            <li key={key}>{value}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    {processing ? 'Guardando...' : 'Crear Clase'}
                                </button>
                                <Link
                                    href={route('clases.index')}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-center"
                                >
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
