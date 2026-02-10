import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';

export default function Show({ guia }) {
    const { hasAnyRole } = usaRoleUser();
    const { flash } = usePage().props;

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta guía?')) {
            router.delete(route('guias.destroy', guia.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={guia.titulo} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href={route('guias.index')} className="text-blue-600 mb-6 inline-block">← Volver a Guías</Link>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{guia.titulo}</h1>
                        <p className="text-sm text-gray-600 mb-4">Nivel: {guia.nivel}</p>

                        {guia.contenido ? (
                            <div className="prose max-w-none text-gray-800">
                                <p>{guia.contenido}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">Sin contenido.</p>
                        )}

                        {/* Lista de ejercicios */}
                        {((guia.guia_ejercicio && guia.guia_ejercicio.length > 0) || (guia.guiaEjercicio && guia.guiaEjercicio.length > 0)) && (
                            <div className="mt-6 pt-6 border-t">
                                <h2 className="text-2xl font-bold mb-4">Ejercicios</h2>
                                <div className="space-y-4">
                                    {(guia.guia_ejercicio ?? guia.guiaEjercicio ?? []).map((g) => (
                                        <div key={g.id} className="bg-gray-50 p-4 rounded border">
                                            <h3 className="font-bold text-lg">{g.ejercicio.nombre}</h3>
                                            <p className="text-sm text-gray-600">{g.series} series × {g.repeticiones} repeticiones</p>
                                            {g.instrucciones && <p className="mt-2 text-gray-700">{g.instrucciones}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            {hasAnyRole(['entrenador', 'superusuario']) && (
                                <>
                                    <Link href={route('guias.edit', guia.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                                        Editar
                                    </Link>
                                    <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
