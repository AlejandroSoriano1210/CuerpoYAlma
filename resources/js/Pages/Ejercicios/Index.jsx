import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EjercicioCreateModal from '@/Components/EjercicioCreateModal';
import { Zap } from 'lucide-react';

export default function Index() {
    const { ejercicios, flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Ejercicios" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                            <Zap className="text-green-600" size={36} />
                            Ejercicios
                        </h1>
                        <p className="text-gray-300">Gestiona el catálogo de ejercicios disponibles en el gimnasio</p>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                            {flash.success}
                        </div>
                    )}

                    {/* Botón crear ejercicio */}
                    <div className="mb-6 text-right">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                        >
                            + Nuevo Ejercicio
                        </button>
                    </div>

                    {/* Ejercicios Grid */}
                    <div>
                        {ejercicios?.data?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {ejercicios.data.map((e) => (
                                    <div key={e.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex flex-col">
                                        {e.imagen_url && (
                                            <img
                                                src={e.imagen_url}
                                                alt={`Foto de ${e.nombre}`}
                                                className="mb-4 h-40 w-full rounded-lg object-cover"
                                            />
                                        )}
                                        {/* Header */}
                                        <div className="mb-4">
                                            <Link href={route('ejercicios.show', e.id)}>
                                                <h3 className="font-bold text-lg text-gray-900 hover:text-green-600 cursor-pointer transition-colors mb-1">
                                                    {e.nombre}
                                                </h3>
                                            </Link>
                                            {e.musculo_objetivo && (
                                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                    {e.musculo_objetivo}
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {e.descripcion && (
                                            <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{e.descripcion}</p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                            <Link href={route('ejercicios.show', e.id)} className="text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                Ver
                                            </Link>
                                            <Link href={route('ejercicios.edit', e.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <Zap size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No hay ejercicios registrados.</p>
                            </div>
                        )}
                    </div>

                    {/* Paginación */}
                    <div className="mt-8 flex justify-center items-center gap-3">
                        {ejercicios?.prev_page_url && (
                            <Link href={route('ejercicios.index', { page: ejercicios.current_page - 1 })} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition">← Anterior</Link>
                        )}
                        <div className="text-sm text-gray-600">Página {ejercicios?.current_page} de {ejercicios?.last_page}</div>
                        {ejercicios?.next_page_url && (
                            <Link href={route('ejercicios.index', { page: ejercicios.current_page + 1 })} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition">Siguiente →</Link>
                        )}
                    </div>
                </div>
            </div>

            <EjercicioCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
