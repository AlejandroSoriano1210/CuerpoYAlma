import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ClientesShow({ cliente }) {
    const handleDelete = () => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${cliente.name}?`)) {
            router.delete(route('clientes.destroy', cliente.id), {
                onSuccess: () => {
                    // Redirige automáticamente
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Cliente: ${cliente.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <Link
                            href={route('clientes.index')}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                            ← Volver a Clientes
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Información Personal */}
                        <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">{cliente.name}</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Nombre</label>
                                    <p className="text-gray-900 mt-1 font-medium">{cliente.name}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <p className="text-gray-900 mt-1 font-medium">{cliente.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                                    <p className="text-gray-900 mt-1 font-medium">{cliente.telefono || '-'}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Fecha de Registro</label>
                                    <p className="text-gray-900 mt-1 font-medium">
                                        {new Date(cliente.created_at).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="mt-8 space-y-3">
                                <Link
                                    href={route('clientes.edit', cliente.id)}
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                                >
                                    Editar Cliente
                                </Link>

                                <button
                                    onClick={handleDelete}
                                    className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Eliminar Cliente
                                </button>
                            </div>
                        </div>

                        {/* Clases Reservadas */}
                        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Clases Reservadas ({cliente.clasesReservadas?.length || 0})
                            </h2>

                            {cliente.clasesReservadas && cliente.clasesReservadas.length > 0 ? (
                                <div className="space-y-4">
                                    {cliente.clasesReservadas.map((clase) => (
                                        <div
                                            key={clase.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{clase.nombre}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Entrenador: <span className="font-medium">{clase.entrenador}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-600">📅 Fecha:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(clase.fecha).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">⏰ Horario:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {clase.hora_inicio} - {clase.hora_fin}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">
                                    <p className="text-lg">No tiene clases reservadas</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
