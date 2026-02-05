import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BackLink, FormField, FlashMessage } from '@/Components';

export default function Edit({ horario }) {
    const { data, setData, patch, errors, processing } = useForm({
        nombre: horario.nombre,
        capacidad: horario.capacidad,
        fecha: horario.fecha,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        descripcion: horario.descripcion || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('clases.update', horario.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar: ${horario.nombre}`} />

            <div className="py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <BackLink href={route('clases.index')} text="Volver a Clases" />

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Editar Clase</h1>

                        <FlashMessage />

                        <form onSubmit={handleSubmit}>
                            <FormField
                                label="Nombre de la Clase"
                                name="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                required
                            />

                            <FormField
                                label="Capacidad"
                                name="capacidad"
                                type="number"
                                value={data.capacidad}
                                onChange={(e) => setData('capacidad', e.target.value)}
                                error={errors.capacidad}
                                min={1}
                                max={50}
                            />

                            <FormField
                                label="Fecha"
                                name="fecha"
                                type="date"
                                value={data.fecha}
                                onChange={(e) => setData('fecha', e.target.value)}
                                error={errors.fecha}
                            />

                            <FormField
                                label="Hora Inicio"
                                name="hora_inicio"
                                type="time"
                                value={data.hora_inicio}
                                onChange={(e) => setData('hora_inicio', e.target.value)}
                                error={errors.hora_inicio}
                            />

                            <FormField
                                label="Hora Fin"
                                name="hora_fin"
                                type="time"
                                value={data.hora_fin}
                                onChange={(e) => setData('hora_fin', e.target.value)}
                                error={errors.hora_fin}
                            />

                            <FormField
                                label="Descripción (opcional)"
                                name="descripcion"
                                type="textarea"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                placeholder="Detalles sobre la clase..."
                                rows={3}
                            />

                            {/* Botones */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                                <Link
                                    href={route('clases.index')}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-center"
                                >
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
