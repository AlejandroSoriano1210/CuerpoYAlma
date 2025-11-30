import React from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index({ entrenadores }) {
    const { flash } = usePage().props;
    const eliminar = (id, name) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
            router.delete(route("entrenadores.destroy", id), {
                onError: () => {
                    alert("Error al eliminar el entrenador");
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Entrenadores" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Entrenadores
                        </h1>

                        <Link
                            href={route("entrenadores.create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            + Nuevo Entrenador
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {entrenadores.map((entrenador) => (
                                    <tr
                                        key={entrenador.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {entrenador.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {entrenador.email}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={route(
                                                    "entrenadores.show",
                                                    entrenador.id
                                                )}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Ver
                                            </Link>
                                            <Link
                                                href={route(
                                                    "entrenadores.edit",
                                                    entrenador.id
                                                )}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => eliminar(entrenador.id, entrenador.name)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
