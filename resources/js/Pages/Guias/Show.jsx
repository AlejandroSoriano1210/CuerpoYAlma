import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';

export default function Show({ guia, clientes = [], isAssigned = false }) {
    const { hasAnyRole } = usaRoleUser();
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta guía?')) {
            router.delete(route('guias.destroy', guia.id));
        }
    };

    const handleComplete = () => {
        if (confirm('¿Marcar esta guía como completada? Se eliminará de tu dashboard.')) {
            router.delete(route('guias.unassign', guia.id));
        }
    };

    const handleAssignToClient = (e) => {
        e.preventDefault();
        if (!selectedClientId) {
            alert('Por favor selecciona un cliente');
            return;
        }
        router.post(route('guias.assign-to-client', guia.id), {
            client_id: selectedClientId,
        });
        setShowModal(false);
        setSelectedClientId('');
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

                        <div className="mt-6 flex gap-3 flex-wrap">
                            <a
                                href={route('guias.downloadPdf', guia.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descargar PDF
                            </a>
                            {!hasAnyRole(['entrenador', 'superusuario']) && (
                                <>
                                    {!isAssigned ? (
                                        <button
                                            onClick={() => {
                                                router.post(route('guias.assign', guia.id));
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Asignar guía a mi dashboard
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleComplete}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            ✓ Marcar como completada
                                        </button>
                                    )}
                                </>
                            )}
                            {hasAnyRole(['entrenador', 'superusuario']) && (
                                <>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Asignar a cliente
                                    </button>
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

            {/* Modal para asignar a cliente */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Asignar guía a cliente</h2>

                        <form onSubmit={handleAssignToClient}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un cliente</label>
                                <select
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Selecciona un cliente --</option>
                                    {clientes.map((cliente) => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.name} ({cliente.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Asignar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedClientId('');
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
