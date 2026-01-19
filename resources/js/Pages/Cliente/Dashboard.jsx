import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard({ proximasClases, historialClases, guiaActual, estadisticas, clasesPorMes }) {
    return (
        <AuthenticatedLayout>
            <Head title="Mi Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Título */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Mi Dashboard</h1>
                        <p className="text-gray-600 mt-2">Bienvenido a tu área personal de entrenamiento</p>
                    </div>

                    {/* Cards de Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Clases Tomadas</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {estadisticas.total_clases_tomadas}
                                    </p>
                                </div>
                                <div className="text-blue-600 text-4xl">📊</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Próximas Clases</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        {estadisticas.total_clases_reservadas}
                                    </p>
                                </div>
                                <div className="text-green-600 text-4xl">🎯</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">En Lista de Espera</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-2">
                                        {estadisticas.en_lista_espera}
                                    </p>
                                </div>
                                <div className="text-orange-600 text-4xl">⏳</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Guía Asignada</p>
                                    <p className="text-2xl font-bold text-purple-600 mt-2">
                                        {guiaActual ? '✓' : '-'}
                                    </p>
                                </div>
                                <div className="text-purple-600 text-4xl">📋</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid: Próximas Clases y Guía Actual */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Próximas Clases */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">📅 Próximas Clases</h2>
                                    <Link
                                        href="/clases"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Ver más →
                                    </Link>
                                </div>

                                {proximasClases.length > 0 ? (
                                    <div className="space-y-4">
                                        {proximasClases.map((clase) => (
                                            <div
                                                key={clase.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {clase.nombre}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            🏋️ {clase.entrenador}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-sm text-gray-600">
                                                                📍 {clase.fecha}
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                🕐 {clase.hora_inicio} - {clase.hora_fin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                                                clase.dias_restantes === 0
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : clase.dias_restantes === 1
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}
                                                        >
                                                            {clase.dias_restantes === 0
                                                                ? 'Hoy'
                                                                : clase.dias_restantes === 1
                                                                ? 'Mañana'
                                                                : `En ${clase.dias_restantes} días`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No tienes clases próximas reservadas</p>
                                        <Link
                                            href="/clases"
                                            className="text-blue-600 hover:text-blue-800 font-medium mt-3 inline-block"
                                        >
                                            Ver clases disponibles →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Guía Actual */}
                        <div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Guía Actual</h2>

                                {guiaActual ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {guiaActual.titulo}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-2">
                                                Nivel: <span className="font-medium text-gray-900">{guiaActual.nivel}</span>
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Ejercicios: <span className="font-medium text-gray-900">
                                                    {guiaActual.ejercicios_count}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 text-xs mt-3">
                                                Asignada: {guiaActual.asignada_el}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/guias/${guiaActual.id}`}
                                            className="block w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition text-center"
                                        >
                                            Ver Guía →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No tienes guía asignada</p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            Contacta con tu entrenador para obtener una
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Clases por Mes */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Progreso - Últimos 6 Meses</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={clasesPorMes}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="cantidad"
                                    stroke="#3b82f6"
                                    name="Clases Realizadas"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Historial de Clases */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">📝 Historial de Clases</h2>
                            <Link
                                href="/clases"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Ver más →
                            </Link>
                        </div>

                        {historialClases.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Clase
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Entrenador
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hora
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {historialClases.map((clase) => (
                                            <tr key={clase.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {clase.nombre}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {clase.entrenador}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {clase.fecha}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {clase.hora_inicio} - {clase.hora_fin}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No hay clases en el historial</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
