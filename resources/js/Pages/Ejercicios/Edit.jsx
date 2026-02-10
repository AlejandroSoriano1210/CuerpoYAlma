import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BackLink, FormField, ImageUpload } from '@/Components';

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
                        <BackLink href={route('ejercicios.index')} text="Volver a Ejercicios" />

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Editar Ejercicio</h1>

                        <form onSubmit={handleSubmit}>
                            <FormField
                                label="Nombre"
                                name="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                required
                            />

                            <FormField
                                label="Músculo objetivo (opcional)"
                                name="musculo_objetivo"
                                value={data.musculo_objetivo}
                                onChange={(e) => setData('musculo_objetivo', e.target.value)}
                                error={errors.musculo_objetivo}
                            />

                            <FormField
                                label="Descripción (opcional)"
                                name="descripcion"
                                type="textarea"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                rows={4}
                            />

                            <ImageUpload
                                label="Foto (opcional)"
                                currentImageUrl={ejercicio.imagen_url}
                                newImage={data.imagen}
                                onImageChange={(file) => setData('imagen', file)}
                                removeImage={data.remove_imagen}
                                onRemoveChange={(checked) => setData('remove_imagen', checked)}
                                error={errors.imagen}
                                altText={`Foto de ${ejercicio.nombre}`}
                            />

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
