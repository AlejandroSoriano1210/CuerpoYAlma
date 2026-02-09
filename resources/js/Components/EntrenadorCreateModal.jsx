import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, AlertTriangle } from 'lucide-react';
import { validarEmail, validarPassword, validarPasswordConfirmation, validarNombre, validarTelefono } from '@/Utils/validations';

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

const ROLE_LABELS = {
    entrenador: 'Entrenador',
    jefe_entrenadores: 'Jefe de entrenadores',
    tecnico: 'Técnico',
    jefe_tecnicos: 'Jefe de técnicos',
    limpieza: 'Limpieza',
    jefe_limpieza: 'Jefe de limpieza',
};

export default function EntrenadorCreateModal({ isOpen, onClose, onSuccess, rolesDisponibles = [] }) {
    const [horariosPorDia, setHorariosPorDia] = useState({
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
    });
    const [totalHoras, setTotalHoras] = useState(0);
    const [validationError, setValidationError] = useState('');
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        telefono: false,
        password: false,
        password_confirmation: false,
    });

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        email: '',
        telefono: '',
        password: '',
        password_confirmation: '',
        rol: rolesDisponibles[0] || 'entrenador',
        horarios: [],
    });

    // Validaciones en tiempo real
    const nombreError = validarNombre(data.name);
    const emailError = validarEmail(data.email);
    const telefonoError = validarTelefono(data.telefono, false); // obligatorio
    const passwordError = validarPassword(data.password, 8);
    const passwordConfirmationError = validarPasswordConfirmation(data.password, data.password_confirmation);

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

    const handleClose = () => {
        reset();
        setHorariosPorDia({
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
        });
        setTotalHoras(0);
        setValidationError('');
        setTouched({
            name: false,
            email: false,
            telefono: false,
            password: false,
            password_confirmation: false,
        });
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar nombre
        if (nombreError !== true) {
            setValidationError(nombreError);
            setTouched(prev => ({ ...prev, name: true }));
            return;
        }

        // Validar email
        if (emailError !== true) {
            setValidationError(emailError);
            setTouched(prev => ({ ...prev, email: true }));
            return;
        }

        // Validar teléfono
        if (telefonoError !== true) {
            setValidationError(telefonoError);
            setTouched(prev => ({ ...prev, telefono: true }));
            return;
        }

        // Validar contraseña
        if (passwordError !== true) {
            setValidationError(passwordError);
            setTouched(prev => ({ ...prev, password: true }));
            return;
        }

        // Validar confirmación de contraseña
        if (passwordConfirmationError !== true) {
            setValidationError(passwordConfirmationError);
            setTouched(prev => ({ ...prev, password_confirmation: true }));
            return;
        }

        // Validar horas mínimas
        if (totalHoras < 20) {
            setValidationError(`El empleado debe tener mínimo 20 horas asignadas. Actualmente tiene ${totalHoras.toFixed(2)} horas.`);
            return;
        }

        setValidationError('');
        post(route('entrenadores.store'), {
            onSuccess: () => {
                handleClose();
                onSuccess?.();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Empleado</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Datos básicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    onBlur={() => setTouched({ ...touched, name: true })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        touched.name && nombreError !== true
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Juan Pérez"
                                />
                                {touched.name && nombreError !== true && (
                                    <p className="text-red-500 text-sm mt-1">{nombreError}</p>
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
                                    onBlur={() => setTouched({ ...touched, email: true })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        touched.email && emailError !== true
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="juan@example.com"
                                />
                                {touched.email && emailError !== true && (
                                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {rolesDisponibles.map((rol) => (
                                        <option key={rol} value={rol}>
                                            {ROLE_LABELS[rol] || rol}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    onBlur={() => setTouched({ ...touched, telefono: true })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        touched.telefono && telefonoError !== true
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="600123456"
                                />
                                {touched.telefono && telefonoError !== true && (
                                    <p className="text-red-500 text-sm mt-1">{telefonoError}</p>
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
                                    onBlur={() => setTouched({ ...touched, password: true })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        touched.password && passwordError !== true
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="••••••••"
                                />
                                {touched.password && passwordError !== true && (
                                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
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
                                    onBlur={() => setTouched({ ...touched, password_confirmation: true })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        touched.password_confirmation && passwordConfirmationError !== true
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="••••••••"
                                />
                                {touched.password_confirmation && passwordConfirmationError !== true && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {passwordConfirmationError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Horario de Trabajo */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Horario de Trabajo
                                </h3>
                                <div
                                    className={`text-sm font-semibold px-3 py-1 rounded ${
                                        totalHoras < 20
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : totalHoras > 40
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                    {totalHoras.toFixed(2)} / 20-40 horas
                                </div>
                            </div>
                            {totalHoras < 20 && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4 text-sm">
                                    <AlertTriangle className="w-4 h-4 inline" /> El empleado debe tener mínimo 20 horas asignadas. Actualmente tiene {totalHoras.toFixed(2)} horas.
                                </div>
                            )}
                            {totalHoras > 40 && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                    <AlertTriangle className="w-4 h-4 inline" /> El total de horas ({totalHoras.toFixed(2)}) supera el máximo permitido de 40 horas.
                                </div>
                            )}

                            <div className="space-y-4">
                                {DIAS_SEMANA.map((dia) => (
                                    <div
                                        key={dia.id}
                                        className="p-4 bg-white rounded border border-gray-200"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-gray-900">
                                                {dia.nombre}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => handleAddBloque(dia.id)}
                                                className="text-green-600 hover:text-green-700 font-medium text-sm"
                                            >
                                                + Agregar bloque
                                            </button>
                                        </div>

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
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500"
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
                                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-green-500"
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
                                                            className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2"
                                                        >
                                                            <X className="w-4 h-4" />
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

                        {/* Buttons */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                            {validationError && (
                                <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {validationError}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing || totalHoras > 40 || totalHoras < 20}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                            >
                                {processing ? 'Guardando...' : 'Crear Empleado'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
