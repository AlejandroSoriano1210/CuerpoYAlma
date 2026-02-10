import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import EjercicioCreateModal from '@/Components/EjercicioCreateModal';
import { PageHeader, FlashMessage, Pagination, EmptyState, StatusBadge } from '@/Components';
import { Zap } from 'lucide-react';

export default function Index() {
    const { ejercicios } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Ejercicios" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header con componente reutilizable */}
                    <PageHeader
                        title="Ejercicios"
                        description="Gestiona el catálogo de ejercicios disponibles en el gimnasio"
                        icon={<Zap size={36} />}
                        actions={
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                            >
                                + Nuevo Ejercicio
                            </button>
                        }
                    />

                    {/* Flash messages con componente reutilizable */}
                    <FlashMessage />

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
                                                <StatusBadge status={e.musculo_objetivo} variant="purple" size="md" />
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
                                            <Link href={route('ejercicios.destroy', e.id)} method="delete" as="button" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm" onClick={(e) => {
                                                if (!confirm('¿Estás seguro de que deseas eliminar este ejercicio?')) {
                                                    e.preventDefault();
                                                }
                                            }}>
                                                Eliminar
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Zap size={48} />}
                                message="No hay ejercicios registrados."
                                action={
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
                                    >
                                        + Crear primer ejercicio
                                    </button>
                                }
                            />
                        )}
                    </div>

                    {/* Paginación con componente reutilizable */}
                    <Pagination data={ejercicios} routeName="ejercicios.index" />
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
