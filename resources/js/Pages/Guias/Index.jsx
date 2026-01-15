import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';

export default function GuiasIndex() {
    const { hasAnyRole } = usaRoleUser();
    const { guias, flash } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="Guías" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Guías de ejercicios</h1>

                        {hasAnyRole(['entrenador', 'superusuario']) && (
                            <Link
                                href={route('guias.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                + Crear Guía
                            </Link>
                        )}
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {guias?.data?.length > 0 ? (
                            guias.data.map((guia) => (
                                <div key={guia.id} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{guia.titulo}</h3>
                                            <p className="text-sm text-gray-600">Nivel: {guia.nivel}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={route('guias.show', guia.id)} className="text-blue-600 hover:text-blue-900">
                                                Ver
                                            </Link>
                                            {hasAnyRole(['entrenador', 'superusuario']) && (
                                                <Link href={route('guias.edit', guia.id)} className="text-yellow-600 hover:text-yellow-800">
                                                    Editar
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {guia.contenido && (
                                        <p className="text-gray-700 mt-3">{guia.contenido.substring(0, 200)}{guia.contenido.length > 200 ? '...' : ''}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No hay guías aún.</p>
                        )}
                    </div>

                    {/* Paginación simple */}
                    <div className="mt-6 flex justify-center items-center gap-3">
                        {guias?.prev_page_url && (
                            <Link href={route('guias.index', { page: guias.current_page - 1 })} className="bg-gray-200 px-3 py-2 rounded">← Anterior</Link>
                        )}
                        <div className="text-sm text-gray-600">Página {guias?.current_page} de {guias?.last_page}</div>
                        {guias?.next_page_url && (
                            <Link href={route('guias.index', { page: guias.current_page + 1 })} className="bg-gray-200 px-3 py-2 rounded">Siguiente →</Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
