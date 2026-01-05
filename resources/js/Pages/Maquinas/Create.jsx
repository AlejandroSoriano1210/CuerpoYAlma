import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        nombre: '',
        descripcion: '',
        ubicacion: '',
        estado: 'operativa',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('maquinas.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Máquina" />

            <div className="py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <Link href={route('maquinas.index')} className="text-blue-600 mb-6 inline-block">← Volver a Máquinas</Link>

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Crear Nueva Máquina</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                                <input
                                    type="text"
                                    value={data.ubicacion}
                                    onChange={(e) => setData('ubicacion', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.ubicacion ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.ubicacion && <p className="text-red-500 text-sm mt-1">{errors.ubicacion}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="operativa">Operativa</option>
                                    <option value="mantenimiento">Mantenimiento</option>
                                    <option value="fuera_de_servicio">Fuera de servicio</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                                <textarea value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" />
                            </div>

                            <div className="flex gap-4">
                                <button type="submit" disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">{processing ? 'Guardando...' : 'Crear Máquina'}</button>
                                <Link href={route('maquinas.index')} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-center">Cancelar</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
