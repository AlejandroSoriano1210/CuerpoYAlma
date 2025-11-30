import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ entrenador }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Entrenador: ${entrenador.name}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-3xl font-bold mb-6 text-gray-900">{entrenador.name}</h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Información Personal</h2>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <p className="text-gray-900 text-lg">{entrenador.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-gray-900 text-lg">{entrenador.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                                    <p className="text-gray-900 text-lg">
                                        {new Date(entrenador.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                                    <p className="text-gray-900 text-lg">
                                        {new Date(entrenador.updated_at).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Clases que imparte */}
                        {entrenador.clases && entrenador.clases.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-700 mb-4">Clases que Imparte</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {entrenador.clases.map((clase) => (
                                        <li key={clase.id} className="text-gray-900">
                                            {clase.nombre} (Capacidad: {clase.capacidad})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex gap-4">
                            <Link
                                href={route('entrenadores.edit', entrenador.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                            >
                                Editar
                            </Link>

                            <Link
                                href={route('entrenadores.index')}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
                            >
                                Volver
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
