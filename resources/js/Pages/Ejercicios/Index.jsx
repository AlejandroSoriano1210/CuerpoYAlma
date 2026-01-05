import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    const { ejercicios, flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="Ejercicios" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Ejercicios</h1>

                        <Link href={route('ejercicios.create')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            + Crear Ejercicio
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {ejercicios?.data?.length > 0 ? (
                            ejercicios.data.map((e) => (
                                <div key={e.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                <Link
                                                    href={route('ejercicios.show', e.id)}
                                                    className="text-gray-900 hover:text-blue-600 hover:underline"
                                                >
                                                    {e.nombre}
                                                </Link>
                                            </h3>
                                            <p className="text-sm text-gray-600">{e.musculo_objetivo}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={route('ejercicios.edit', e.id)} className="text-yellow-600 hover:text-yellow-800">Editar</Link>
                                        </div>
                                    </div>

                                    {e.descripcion && (
                                        <p className="text-gray-700 mt-3">{e.descripcion}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay ejercicios aún.</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-3">
                        {ejercicios?.prev_page_url && (
                            <Link href={route('ejercicios.index', { page: ejercicios.current_page - 1 })} className="bg-gray-200 px-3 py-2 rounded">← Anterior</Link>
                        )}
                        <div className="text-sm text-gray-600">Página {ejercicios?.current_page} de {ejercicios?.last_page}</div>
                        {ejercicios?.next_page_url && (
                            <Link href={route('ejercicios.index', { page: ejercicios.current_page + 1 })} className="bg-gray-200 px-3 py-2 rounded">Siguiente →</Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
