import React from 'react';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BackLink, FlashMessage, FormActions, EjercicioSelector } from '@/Components';

export default function Create({ niveles, ejercicios }) {
    const { data, setData, post, errors, processing } = useForm({
        titulo: '',
        nivel: 'principiante',
        contenido: '',
        ejercicios: [],
    });

    const [ejerciciosList, setEjerciciosList] = React.useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            titulo: data.titulo,
            nivel: data.nivel,
            contenido: data.contenido,
            ejercicios: ejerciciosList,
        };
        router.post(route('guias.store'), formData);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Guía" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <BackLink href={route('guias.index')} text="Volver a Guías" />

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Crear Nueva Guía</h1>

                        <FlashMessage />

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                                <input
                                    type="text"
                                    value={data.titulo}
                                    onChange={(e) => setData('titulo', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.titulo ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                                <select
                                    value={data.nivel}
                                    onChange={(e) => setData('nivel', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.nivel ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    {niveles.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                {errors.nivel && <p className="text-red-500 text-sm mt-1">{errors.nivel}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                                <textarea
                                    value={data.contenido}
                                    onChange={(e) => setData('contenido', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="6"
                                />
                            </div>

                            <EjercicioSelector
                                ejercicios={ejercicios}
                                value={ejerciciosList}
                                onChange={setEjerciciosList}
                            />

                            <FormActions
                                processing={processing}
                                cancelHref={route('guias.index')}
                                submitText="Crear Guía"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
