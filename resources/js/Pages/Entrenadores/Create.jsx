import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const DIAS_SEMANA = [
    { id: 0, nombre: 'Lunes' },
    { id: 1, nombre: 'Martes' },
    { id: 2, nombre: 'Miércoles' },
    { id: 3, nombre: 'Jueves' },
    { id: 4, nombre: 'Viernes' },
    { id: 5, nombre: 'Sábado' },
];

const calcularTotalHoras = (horarios) => {
    let total = 0;
    Object.values(horarios).forEach((bloques) => {
        bloques.forEach((bloque) => {
            if (bloque.hora_inicio && bloque.hora_fin) {
                const inicio = bloque.hora_inicio.split(':');
                const fin = bloque.hora_fin.split(':');
                const inicioMinutos = parseInt(inicio[0]) * 60 + parseInt(inicio[1]);
                const finMinutos = parseInt(fin[0]) * 60 + parseInt(fin[1]);
                const diferencia = Math.max(0, finMinutos - inicioMinutos);
                total += diferencia / 60;
            }
        });
    });
    return total;
};

export default function Create() {
    const { flash } = usePage().props;

    const [horariosPorDia, setHorariosPorDia] = useState({
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
    });
    const [totalHoras, setTotalHoras] = useState(0);

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        telefono: '',
        password: '',
        password_confirmation: '',
        rol: 'entrenador',
        horarios: [],
    });

    const handleAddBloque = (dia) => {
        const nuevosHorarios = { ...horariosPorDia };
        nuevosHorarios[dia] = [
            ...nuevosHorarios[dia],
            { id: Date.now(), hora_inicio: '09:00', hora_fin: '13:00' },
        ];
        setHorariosPorDia(nuevosHorarios);
        actualizarFormulario(nuevosHorarios);
        setTotalHoras(calcularTotalHoras(nuevosHorarios));
    };

    const handleRemoveBloque = (dia, id) => {
        const nuevosHorarios = { ...horariosPorDia };
        nuevosHorarios[dia] = nuevosHorarios[dia].filter((b) => b.id !== id);
        setHorariosPorDia(nuevosHorarios);
        actualizarFormulario(nuevosHorarios);
        setTotalHoras(calcularTotalHoras(nuevosHorarios));
    };

    const handleActualizarBloque = (dia, id, field, value) => {
        const nuevosHorarios = { ...horariosPorDia };
        nuevosHorarios[dia] = nuevosHorarios[dia].map((b) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        setHorariosPorDia(nuevosHorarios);
        actualizarFormulario(nuevosHorarios);
        setTotalHoras(calcularTotalHoras(nuevosHorarios));
    };

    const actualizarFormulario = (horarios) => {
        const horariosArray = [];
        Object.entries(horarios).forEach(([dia, bloques]) => {
            bloques.forEach((bloque) => {
                horariosArray.push({
                    dia_semana: parseInt(dia),
                    hora_inicio: bloque.hora_inicio,
                    hora_fin: bloque.hora_fin,
                });
            });
        });
        setData('horarios', horariosArray);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('entrenadores.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Crear Empleado" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-900">
                            Crear Nuevo Empleado
                        </h1>

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                {flash.success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Datos básicos */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.name
                                                ? 'border-red-500'
                                                : 'border-gray-300'
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.email
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="juan@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Rol */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rol
                                    </label>
                                    <select
                                        value={data.rol}
                                        onChange={(e) => setData('rol', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.rol
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="entrenador">Entrenador</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="limpieza">Limpieza</option>
                                    </select>
                                    {errors.rol && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.rol}
                                        </p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono (opcional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.telefono}
                                        onChange={(e) => setData('telefono', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.telefono
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="600123456"
                                    />
                                    {errors.telefono && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.telefono}
                                        </p>
                                    )}
                                </div>

                                {/* Contraseña */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.password
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirmar Contraseña */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData('password_confirmation', e.target.value)
                                        }
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.password_confirmation
                                                ? 'border-red-500'
                                                : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Horario de Trabajo */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Horario de Trabajo
                                    </h2>
                                    <div className={`text-sm font-semibold px-3 py-1 rounded ${
                                        totalHoras > 40
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {totalHoras.toFixed(2)} / 40 horas
                                    </div>
                                </div>
                                {totalHoras > 40 && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                        ⚠️ El total de horas ({totalHoras.toFixed(2)}) supera el máximo permitido de 40 horas.
                                    </div>
                                )}
                                {errors.horarios && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                        {errors.horarios}
                                    </div>
                                )}

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
                                                    onClick={() => handleAddBloque(dia.id)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                                                >
                                                    + Agregar bloque
                                                </button>
                                            </div>

                                            {/* Bloques de horarios para este día */}
                                            {horariosPorDia[dia.id].length > 0 ? (
                                                <div className="space-y-2">
                                                    {horariosPorDia[dia.id].map((bloque) => (
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
                                                                    onChange={(e) =>
                                                                        handleActualizarBloque(
                                                                            dia.id,
                                                                            bloque.id,
                                                                            'hora_inicio',
                                                                            e.target.value
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
                                                                    onChange={(e) =>
                                                                        handleActualizarBloque(
                                                                            dia.id,
                                                                            bloque.id,
                                                                            'hora_fin',
                                                                            e.target.value
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
                                                    ))}
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
                                    disabled={processing || totalHoras > 40}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Crear Empleado'}
                                </button>
                                <Link
                                    href={route('entrenadores.index')}
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
