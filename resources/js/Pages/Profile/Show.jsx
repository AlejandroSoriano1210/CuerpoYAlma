import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import MonthlyBarChart from "@/Components/Charts/MonthlyBarChart";

export default function Show({ resumenAnual = {}, user = null, status = null }) {
    const resumen = resumenAnual || {};

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Perfil
                </h2>
            }
        >
            {status && (
                <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
                    <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
                        {status}
                    </div>
                </div>
            )}
            <Head title="Perfil" />

            <div className="py-12">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{user?.name || 'Usuario'}</h1>
                    <Link
                        href={route('profile.edit')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
                    >
                        Editar perfil
                    </Link>
                </div>

                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h2 className="text-lg font-medium text-gray-900">Datos</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded">
                                <h3 className="text-sm text-gray-600">Email</h3>
                                <p className="text-sm text-gray-900">{user?.email}</p>
                            </div>

                            <div className="p-4 border rounded">
                                <h3 className="text-sm text-gray-600">Teléfono</h3>
                                <p className="text-sm text-gray-900">{user?.telefono || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h2 className="text-lg font-medium text-gray-900">Resumen anual ({resumen.year || new Date().getFullYear()})</h2>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded">
                                <h3 className="text-sm text-gray-600">Clases asistidas</h3>
                                <p className="text-2xl font-bold text-gray-900">{resumen.clases_asistidas ?? 0}</p>
                                <p className="text-sm text-gray-500">Total de clases a las que asististe este año</p>
                            </div>

                            <div className="p-4 border rounded">
                                <h3 className="text-sm text-gray-600">Guías utilizadas</h3>
                                <p className="text-2xl font-bold text-gray-900">{resumen.guias_utilizadas ?? 0}</p>
                                <p className="text-sm text-gray-500">Guías consultadas este año</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <MonthlyBarChart data={resumen.clases_por_mes || new Array(12).fill(0)} />
                        </div>

                        {resumen.guias && resumen.guias.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm text-gray-700 font-medium mb-2">Guías consultadas</h4>
                                <ul className="space-y-2">
                                    {resumen.guias.map((g) => (
                                        <li key={g.id} className="text-sm">
                                            <a href={route('guias.show', g.id)} className="text-blue-600 hover:underline">{g.titulo}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
