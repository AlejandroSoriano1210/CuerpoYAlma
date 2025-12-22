import React from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ niveles, ejercicios }) {
    const { flash } = usePage().props;
    const { data, setData, post, errors, processing } = useForm({
        titulo: '',
        nivel: 'principiante',
        contenido: '',
        ejercicios: [],
    });

    const [ejerciciosList, setEjerciciosList] = React.useState([]);
    const [selectedEjercicio, setSelectedEjercicio] = React.useState(ejercicios?.[0]?.id ?? null);
    const [series, setSeries] = React.useState(3);
    const [repeticiones, setRepeticiones] = React.useState(10);
    const [instrucciones, setInstrucciones] = React.useState('');

    const addEjercicio = () => {
        if (!selectedEjercicio) return;
        const ejercicio = ejercicios.find(e => e.id === Number(selectedEjercicio));
        setEjerciciosList(prev => [
            ...prev,
            {
                ejercicio_id: ejercicio.id,
                nombre: ejercicio.nombre,
                series: Number(series) || null,
                repeticiones: Number(repeticiones) || null,
                instrucciones: instrucciones || null,
            },
        ]);

        setSeries(3);
        setRepeticiones(10);
        setInstrucciones('');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('guias.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Guía" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <Link href={route('guias.index')} className="text-blue-600 mb-6 inline-block">
                            ← Volver a Guías
                        </Link>

                        <h1 className="text-2xl font-bold mb-6 text-gray-900">Crear Nueva Guía</h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setData('ejercicios', ejerciciosList);
                            post(route('guias.store'));
                        }}>
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

                            {/* ===== Sección de ejercicios ===== */}
                            <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                                <h3 className="font-bold text-gray-900 mb-3">Ejercicios</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                    <select value={selectedEjercicio} onChange={(e) => setSelectedEjercicio(e.target.value)} className="w-full px-3 py-2 border rounded">
                                        {ejercicios.map((ej) => (
                                            <option key={ej.id} value={ej.id}>{ej.nombre}</option>
                                        ))}
                                    </select>

                                    <div className="flex gap-2">
                                        <input type="number" value={series} onChange={(e) => setSeries(e.target.value)} className="w-1/2 px-3 py-2 border rounded" min="1" />
                                        <input type="number" value={repeticiones} onChange={(e) => setRepeticiones(e.target.value)} className="w-1/2 px-3 py-2 border rounded" min="1" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <textarea value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} placeholder="Instrucciones" className="w-full px-3 py-2 border rounded" rows="3" />
                                </div>

                                <div className="mb-4">
                                    <button type="button" onClick={addEjercicio} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Añadir ejercicio</button>
                                </div>

                                {ejerciciosList.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {ejerciciosList.map((item, index) => (
                                            <div key={index} className="bg-white p-3 rounded border flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">{item.nombre}</p>
                                                    <p className="text-sm text-gray-600">{item.series} series × {item.repeticiones} repeticiones</p>
                                                    {item.instrucciones && <p className="text-sm text-gray-700 mt-1">{item.instrucciones}</p>}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => setEjerciciosList(prev => prev.filter((_, i) => i !== index))} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Eliminar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    {processing ? 'Guardando...' : 'Crear Guía'}
                                </button>

                                <Link href={route('guias.index')} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-center">
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
