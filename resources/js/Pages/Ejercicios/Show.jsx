import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Show({ ejercicio }) {
    const { flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title={ejercicio.nombre} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={route('ejercicios.index')} className="text-blue-600 mb-6 inline-block">← Volver a Ejercicios</Link>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{ejercicio.nombre}</h1>
                        {ejercicio.musculo_objetivo && <p className="text-sm text-gray-600 mb-4">Músculo objetivo: {ejercicio.musculo_objetivo}</p>}
                        {ejercicio.descripcion ? <p className="text-gray-700">{ejercicio.descripcion}</p> : <p className="text-gray-500">Sin descripción.</p>}

                        <div className="mt-4">
                            <Link href={route('ejercicios.edit', ejercicio.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Editar</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
