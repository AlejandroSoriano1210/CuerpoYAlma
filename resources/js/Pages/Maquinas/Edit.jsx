import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BackLink, FormField, ImageUpload, FormActions } from '@/Components';

export default function Edit({ maquina }) {
    const { data, setData, post, errors, processing } = useForm({
        nombre: maquina.nombre,
        descripcion: maquina.descripcion || '',
        ubicacion: maquina.ubicacion || '',
        estado: maquina.estado || 'operativa',
        imagen: null,
        remove_imagen: false,
        _method: 'patch',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('maquinas.update', maquina.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar: ${maquina.nombre}`} />

            <div className="py-12">
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <BackLink href={route('maquinas.index')} text="Volver a Máquinas" />

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Editar Máquina</h1>

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
                                label="Ubicación"
                                name="ubicacion"
                                value={data.ubicacion}
                                onChange={(e) => setData('ubicacion', e.target.value)}
                                error={errors.ubicacion}
                            />

                            <FormField
                                label="Estado"
                                name="estado"
                                type="select"
                                value={data.estado}
                                onChange={(e) => setData('estado', e.target.value)}
                                options={[
                                    { value: 'operativa', label: 'Operativa' },
                                    { value: 'mantenimiento', label: 'Mantenimiento' },
                                    { value: 'fuera_de_servicio', label: 'Fuera de servicio' },
                                ]}
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
                                currentImageUrl={maquina.imagen_url}
                                newImage={data.imagen}
                                onImageChange={(file) => setData('imagen', file)}
                                removeImage={data.remove_imagen}
                                onRemoveChange={(checked) => setData('remove_imagen', checked)}
                                error={errors.imagen}
                                altText={`Foto de ${maquina.nombre}`}
                            />

                            <FormActions
                                processing={processing}
                                cancelHref={route('maquinas.index')}
                                submitText="Guardar Cambios"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
