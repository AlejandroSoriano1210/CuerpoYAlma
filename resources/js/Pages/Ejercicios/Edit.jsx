import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ ejercicio }) {
    const { data, setData, post, errors, processing } = useForm({
        nombre: ejercicio.nombre || '',
        descripcion: ejercicio.descripcion || '',
        musculo_objetivo: ejercicio.musculo_objetivo || '',
        imagen: null,
        remove_imagen: false,
        _method: 'patch',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('ejercicios.update', ejercicio.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar ${ejercicio.nombre}`} />

            <div className="py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <Link href={route('ejercicios.index')} className="text-blue-600 mb-6 inline-block">← Volver a Ejercicios</Link>

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Editar Ejercicio</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Músculo objetivo (opcional)</label>
                                <input
                                    type="text"
                                    value={data.musculo_objetivo}
                                    onChange={(e) => setData('musculo_objetivo', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.musculo_objetivo ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                                <textarea value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Foto (opcional)</label>
                                {ejercicio.imagen_url && !data.imagen && (
                                    <img
                                        src={ejercicio.imagen_url}
                                        alt={`Foto de ${ejercicio.nombre}`}
                                        className="mb-3 h-40 w-full rounded-lg object-cover"
                                    />
                                )}
                                {ejercicio.imagen_url && (
                                    <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={data.remove_imagen}
                                            onChange={(e) => setData('remove_imagen', e.target.checked)}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        Quitar imagen actual
                                    </label>
                                )}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(e) => setData('imagen', e.target.files?.[0] || null)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.imagen ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.imagen && <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>}
                                {data.imagen && (
                                    <img
                                        src={URL.createObjectURL(data.imagen)}
                                        alt="Vista previa"
                                        className="mt-3 h-40 w-full rounded-lg object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button type="submit" disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded">{processing ? 'Guardando...' : 'Guardar'}</button>
                                <Link href={route('ejercicios.index')} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-center">Cancelar</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
