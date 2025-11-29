import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CreateHorario({ clases }) {
    const { flash } = usePage().props;
    const { data, setData, post, errors, processing } = useForm({
        clase_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('clases.horario.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Horario de Clase" />

            <div className="py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Crear Horario de Clase</h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Clase */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Clase
                                </label>
                                <select
                                    value={data.clase_id}
                                    onChange={(e) => setData('clase_id', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.clase_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Selecciona una clase</option>
                                    {clases.map((clase) => (
                                        <option key={clase.id} value={clase.id}>
                                            {clase.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.clase_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.clase_id}</p>
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
                            <div className="mb-6">
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

                            {/* Botones */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    {processing ? 'Guardando...' : 'Crear Horario'}
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
