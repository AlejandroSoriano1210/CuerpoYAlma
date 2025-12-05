import React, { useState } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const DIAS_SEMANA = [
    { id: 0, nombre: "Lunes" },
    { id: 1, nombre: "Martes" },
    { id: 2, nombre: "Miércoles" },
    { id: 3, nombre: "Jueves" },
    { id: 4, nombre: "Viernes" },
    { id: 5, nombre: "Sábado" },
];

const agruparPorDia = (horarios) => {
    const estructura = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

    horarios.forEach((h) => {
        estructura[h.dia_semana].push({
            id: Date.now() + Math.random(),
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
        });
    });

    return estructura;
};

export default function Edit({ entrenador, horarioTrabajo }) {
    const { flash } = usePage().props;

    const [horariosPorDia, setHorariosPorDia] = useState(
        agruparPorDia(horarioTrabajo)
    );

    const { data, setData, patch, errors, processing } = useForm({
        name: entrenador.name,
        email: entrenador.email,
        horarios: horarioTrabajo,
    });

    const actualizarFormulario = (horarios) => {
        const horariosArray = [];
        Object.entries(horarios).forEach(([dia, bloques]) => {
            bloques.forEach((b) => {
                horariosArray.push({
                    dia_semana: parseInt(dia),
                    hora_inicio: b.hora_inicio,
                    hora_fin: b.hora_fin,
                });
            });
        });
        setData("horarios", horariosArray);
    };

    const handleAddBloque = (dia) => {
        const nuevos = { ...horariosPorDia };
        nuevos[dia].push({
            id: Date.now(),
            hora_inicio: "09:00",
            hora_fin: "13:00",
        });
        setHorariosPorDia(nuevos);
        actualizarFormulario(nuevos);
    };

    const handleRemoveBloque = (dia, id) => {
        const nuevos = { ...horariosPorDia };
        nuevos[dia] = nuevos[dia].filter((b) => b.id !== id);
        setHorariosPorDia(nuevos);
        actualizarFormulario(nuevos);
    };

    const handleActualizarBloque = (dia, id, field, value) => {
        const nuevos = { ...horariosPorDia };
        nuevos[dia] = nuevos[dia].map((b) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        setHorariosPorDia(nuevos);
        actualizarFormulario(nuevos);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route("entrenadores.update", entrenador.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar: ${entrenador.name}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900">
                            Editar Entrenador
                        </h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Nombre */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.name
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Juan Pérez"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="juan@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* --- Horarios --- */}
                            <div className="mb-3 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                                    Horario de Trabajo
                                </h2>

                                <div className="space-y-4">
                                    {DIAS_SEMANA.map((dia) => (
                                        <div
                                            key={dia.id}
                                            className="p-4 bg-white rounded border border-gray-200"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    {dia.nombre}
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAddBloque(dia.id)
                                                    }
                                                    className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                                >
                                                    + Agregar bloque
                                                </button>
                                            </div>

                                            {/* Bloques de horarios para este día */}
                                            {horariosPorDia[dia.id].length >
                                            0 ? (
                                                <div className="space-y-2">
                                                    {horariosPorDia[dia.id].map(
                                                        (bloque) => (
                                                            <div
                                                                key={bloque.id}
                                                                className="flex gap-2 items-end bg-gray-50 p-3 rounded"
                                                            >
                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                        Inicio
                                                                    </label>
                                                                    <input
                                                                        type="time"
                                                                        value={
                                                                            bloque.hora_inicio
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleActualizarBloque(
                                                                                dia.id,
                                                                                bloque.id,
                                                                                "hora_inicio",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                                                    />
                                                                </div>

                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                        Fin
                                                                    </label>
                                                                    <input
                                                                        type="time"
                                                                        value={
                                                                            bloque.hora_fin
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleActualizarBloque(
                                                                                dia.id,
                                                                                bloque.id,
                                                                                "hora_fin",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                                                    />
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveBloque(
                                                                            dia.id,
                                                                            bloque.id
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-900 font-medium text-sm px-3 py-2"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">
                                                    Sin horario
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    {processing
                                        ? "Guardando..."
                                        : "Guardar Cambios"}
                                </button>
                                <Link
                                    href={route("entrenadores.index")}
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
