import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ClientesIndex({ clientes }) {
    const { flash } = usePage().props;

    const handleDelete = (id, name) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
            router.delete(route('clientes.destroy', id), {
                onSuccess: () => {
                    // El mensaje flash se muestra automáticamente
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Clientes" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {clientes.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Clases Reservadas</th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Fecha Registro</th>
                                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {clientes.map((cliente) => (
                                        <tr key={cliente.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{cliente.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                                    {cliente.clases_reservadas_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(cliente.created_at).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-center space-x-2">
                                                <Link
                                                    href={route('clientes.show', cliente.id)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Ver
                                                </Link>

                                                <Link
                                                    href={route('clientes.edit', cliente.id)}
                                                    className="text-green-600 hover:text-green-900 font-medium"
                                                >
                                                    Editar
                                                </Link>

                                                <button
                                                    onClick={() => handleDelete(cliente.id, cliente.name)}
                                                    className="text-red-600 hover:text-red-900 font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p className="text-lg">No hay clientes registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
