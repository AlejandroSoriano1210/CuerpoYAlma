import React from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";
import { Clock } from "lucide-react";

const DIAS_SEMANA = [
    { id: 0, nombre: 'Lunes' },
    { id: 1, nombre: 'Martes' },
    { id: 2, nombre: 'Miércoles' },
    { id: 3, nombre: 'Jueves' },
    { id: 4, nombre: 'Viernes' },
    { id: 5, nombre: 'Sábado' },
    { id: 6, nombre: 'Domingo' },
];

export default function Edit({ horarios }) {
    const { flash } = usePage().props;

    // Preparar datos iniciales
    const horariosIniciales = horarios.reduce((acc, h) => {
        acc[h.dia_semana] = {
            hora_apertura: h.hora_apertura.substring(0, 5),
            hora_cierre: h.hora_cierre.substring(0, 5),
        };
        return acc;
    }, {});

    const { data, setData, post, processing, errors } = useForm({
        horarios: horariosIniciales
    });

    const handleChangeHora = (dia, tipo, valor) => {
        setData('horarios', {
            ...data.horarios,
            [dia]: {
                ...data.horarios[dia],
                [tipo]: valor
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('gimnasio-horario.update'), {
            onSuccess: () => {
                router.visit(route('entrenadores.index'));
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Horarios del Gimnasio" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Encabezado */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-green-600" size={32} />
                            Horarios del Gimnasio
                        </h1>
                        <p className="text-gray-300 mt-2">
                            Configura los horarios de apertura y cierre para cada día de la semana
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {errors.general && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {errors.general}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                        <div className="space-y-6">
                            {DIAS_SEMANA.map(dia => (
                                <div key={dia.id} className="border-l-4 border-green-500 pl-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        {dia.nombre}
                                    </label>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-600 uppercase">Apertura</label>
                                            <input
                                                type="time"
                                                value={data.horarios[dia.nombre]?.hora_apertura || ''}
                                                onChange={(e) => handleChangeHora(dia.nombre, 'hora_apertura', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                            />
                                            <InputError
                                                message={errors[`horarios.${dia.nombre}.hora_apertura`]}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <label className="text-xs text-gray-600 uppercase">Cierre</label>
                                            <input
                                                type="time"
                                                value={data.horarios[dia.nombre]?.hora_cierre || ''}
                                                onChange={(e) => handleChangeHora(dia.nombre, 'hora_cierre', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                            />
                                            <InputError
                                                message={errors[`horarios.${dia.nombre}.hora_cierre`]}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botones */}
                        <div className="mt-8 flex gap-4 justify-end">
                            <a
                                href={route('entrenadores.index')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancelar
                            </a>
                            <PrimaryButton
                                disabled={processing}
                                className="px-4 py-2"
                            >
                                {processing ? 'Guardando...' : 'Guardar Horarios'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
