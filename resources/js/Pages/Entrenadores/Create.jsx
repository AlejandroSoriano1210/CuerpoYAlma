import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FlashMessage, FormActions, ScheduleEditor } from '@/Components';
import { calcularTotalHoras } from '@/Components/ScheduleEditor';

export default function Create() {
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

    const handleHorariosChange = (horarios) => {
        setData('horarios', horarios);
        // Calcular total de horas desde el array
        let total = 0;
        horarios.forEach((h) => {
            if (h.hora_inicio && h.hora_fin) {
                const inicio = h.hora_inicio.split(':');
                const fin = h.hora_fin.split(':');
                const inicioMinutos = parseInt(inicio[0]) * 60 + parseInt(inicio[1]);
                const finMinutos = parseInt(fin[0]) * 60 + parseInt(fin[1]);
                total += Math.max(0, finMinutos - inicioMinutos) / 60;
            }
        });
        setTotalHoras(total);
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

                        <FlashMessage />

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
                            <ScheduleEditor
                                onChange={handleHorariosChange}
                                maxHours={40}
                                error={errors.horarios}
                            />

                            {/* Botones */}
                            <FormActions
                                processing={processing}
                                disabled={totalHoras > 40}
                                cancelHref={route('entrenadores.index')}
                                submitText="Crear Empleado"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
