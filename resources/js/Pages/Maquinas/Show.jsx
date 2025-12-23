import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ maquina }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title={maquina.nombre} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={route('maquinas.index')} className="text-blue-600 mb-6 inline-block">← Volver a Máquinas</Link>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{maquina.nombre}</h1>
                        <p className="text-sm text-gray-600 mb-2">Ubicación: {maquina.ubicacion}</p>
                        <p className="text-sm text-gray-600 mb-4">Estado: <span className="capitalize">{maquina.estado.replaceAll('_', ' ')}</span></p>

                        {maquina.descripcion ? <p className="text-gray-700">{maquina.descripcion}</p> : <p className="text-gray-500">Sin descripción.</p>}

                        <div className="mt-4">
                            <Link href={route('maquinas.edit', maquina.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Editar</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
