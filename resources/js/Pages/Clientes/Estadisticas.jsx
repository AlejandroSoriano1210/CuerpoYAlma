import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/Components/Card';
import { validarTelefono } from '@/Utils/validations';

export default function Dashboard({ user, metricas, proximasClases, historialClases, guiaActual, guiasSemanales = [], guiaRecomendadas = [], nivelCondicion = 'Sin datos', estadisticas, clasesPorMes }) {
    const { flash } = usePage().props;

    // Estado para forzar re-render cada minuto
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000); // Actualizar cada minuto

        return () => clearInterval(interval);
    }, []);

    // Filtrar clases según hora actual
    const proximasClasesFiltradas = useMemo(() => {
        return proximasClases.filter((clase) => {
            const fechaClase = new Date(`${clase.fecha}T${clase.hora_fin}:00`);
            return fechaClase >= now;
        });
    }, [proximasClases, now]);

    const historialClasesFiltrado = useMemo(() => {
        return historialClases.filter((clase) => {
            const fechaClase = new Date(`${clase.fecha}T${clase.hora_fin}:00`);
            return fechaClase < now;
        });
    }, [historialClases, now]);

    // Calcular estadísticas dinámicamente basadas en las clases filtradas
    const estadisticasDinamicas = useMemo(() => {
        return {
            total_clases_tomadas: historialClasesFiltrado.length,
            total_clases_reservadas: proximasClasesFiltradas.length,
            en_lista_espera: estadisticas.en_lista_espera,
            total_guias_completadas: estadisticas.total_guias_completadas,
        };
    }, [historialClasesFiltrado, proximasClasesFiltradas, estadisticas]);

    // Obtener la última medición registrada de clasesPorMes (excluyendo el mes actual)
    const ultimaMedicion = useMemo(() => {
        const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long' });
        const mesActualCapitalizado = mesActual.charAt(0).toUpperCase() + mesActual.slice(1);

        const medicionesConDatos = clasesPorMes?.filter(m =>
            (m.peso_kg || m.grasa_corporal_pct) && m.mes !== mesActualCapitalizado
        ) ?? [];
        return medicionesConDatos.length > 0 ? medicionesConDatos[medicionesConDatos.length - 1] : null;
    }, [clasesPorMes]);

    // Valores iniciales: última medición, luego métricas, luego vacío
    const getValorInicial = (campo) => {
        if (ultimaMedicion && ultimaMedicion[campo]) {
            return ultimaMedicion[campo];
        }
        return metricas?.[campo] ?? '';
    };

    const { data, setData, post, processing, errors } = useForm({
        peso_kg: metricas?.peso_kg ?? '',
        altura_cm: metricas?.altura_cm ?? '',
        grasa_corporal_pct: metricas?.grasa_corporal_pct ?? '',
    });

    const {
        data: profileData,
        setData: setProfileData,
        patch: patchProfile,
        processing: processingProfile,
        errors: profileErrors,
        reset: resetProfile,
    } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        telefono: user?.telefono ?? '',
        password: '',
        password_confirmation: '',
    });

    const hasMetrics = Boolean(metricas?.peso_kg || metricas?.altura_cm || metricas?.grasa_corporal_pct);
    const [clasesPage, setClasesPage] = useState(1);
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [rangoMeses, setRangoMeses] = useState(12);
    const [profileValidationErrors, setProfileValidationErrors] = useState({});
    const [measurementFormData, setMeasurementFormData] = useState({
        peso_kg: getValorInicial('peso_kg'),
        altura_cm: getValorInicial('altura_cm'),
        grasa_corporal_pct: getValorInicial('grasa_corporal_pct'),
    });
    const pageSize = 3;

    // Validación del formulario de perfil
    const validateProfileForm = () => {
        const errors = {};

        if (!profileData.name || profileData.name.trim() === '') {
            errors.name = 'El nombre es requerido';
        } else if (profileData.name.length > 255) {
            errors.name = 'El nombre no debe exceder 255 caracteres';
        }

        if (!profileData.email || profileData.email.trim() === '') {
            errors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'El email debe ser válido';
        }

        if (profileData.telefono && profileData.telefono.trim() !== '') {
            const telefonoValidation = validarTelefono(profileData.telefono, false);
            if (telefonoValidation !== true) {
                errors.telefono = telefonoValidation;
            }
        }

        if (profileData.password || profileData.password_confirmation) {
            if (profileData.password.length < 8) {
                errors.password = 'La contraseña debe tener al menos 8 caracteres';
            }
            if (profileData.password !== profileData.password_confirmation) {
                errors.password_confirmation = 'Las contraseñas no coinciden';
            }
        }

        setProfileValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const imcCalculado = useMemo(() => {
        const peso = parseFloat(data.peso_kg);
        const altura = parseFloat(data.altura_cm);
        if (!peso || !altura) return metricas?.imc ?? '';
        const alturaM = altura / 100;
        if (alturaM <= 0) return metricas?.imc ?? '';
        return Number(peso / (alturaM * alturaM)).toFixed(1);
    }, [data.peso_kg, data.altura_cm, metricas?.imc]);

    const buildTiempoRestante = (clase) => {
        const inicio = new Date(`${clase.fecha}T${clase.hora_inicio}:00`);
        const diffMs = inicio.getTime() - Date.now();
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diffMs <= 0) {
            return {
                label: 'En curso',
                tone: 'bg-red-100 text-red-800',
            };
        }

        const diffMinutes = Math.ceil(diffMs / minute);
        const diffHours = Math.ceil(diffMs / hour);
        const diffDays = Math.ceil(diffMs / day);
        const diffDaysFloor = Math.floor(diffMs / day);

        let label;
        if (diffMinutes < 60) {
            label = diffMinutes === 1 ? 'En 1 minuto' : `En ${diffMinutes} minutos`;
        } else if (diffHours < 24) {
            label = diffHours === 1 ? 'En 1 hora' : `En ${diffHours} horas`;
        } else if (diffDays < 7) {
            label = diffDays === 1 ? 'Mañana' : `En ${diffDays} días`;
        } else {
            const diffWeeks = Math.ceil(diffDays / 7);
            label = diffWeeks === 1 ? 'En 1 semana' : `En ${diffWeeks} semanas`;
        }

        const tone = diffDaysFloor <= 0
            ? 'bg-red-100 text-red-800'
            : diffDays === 1
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800';

        return { label, tone };
    };

    // Recomendaciones llegan desde el backend; no se calculan en cliente

    const totalProximas = proximasClasesFiltradas?.length ?? 0;
    const totalProximasPages = Math.max(1, Math.ceil(totalProximas / pageSize));
    const proximasPage = useMemo(() => {
        const start = (clasesPage - 1) * pageSize;
        return proximasClasesFiltradas.slice(start, start + pageSize);
    }, [clasesPage, proximasClasesFiltradas]);

    useEffect(() => {
        if (clasesPage > totalProximasPages) {
            setClasesPage(totalProximasPages || 1);
        }
    }, [clasesPage, totalProximasPages]);

    const clasesPorMesFiltradas = useMemo(() => {
        if (!clasesPorMes || clasesPorMes.length === 0) return [];
        return clasesPorMes.slice(-rangoMeses);
    }, [clasesPorMes, rangoMeses]);
    return (
        <AuthenticatedLayout>
            <Head title="Mis Estadísticas" />

            <div className="py-8 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Encabezado con datos del usuario */}
                    <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                                    {user.name}
                                </h1>
                                <div className="space-y-2">
                                    <p className="text-blue-100 text-lg flex items-center gap-2">
                                        {user.email}
                                    </p>
                                    <p className="text-blue-100 text-lg flex items-center gap-2">
                                        {user.telefono}
                                    </p>
                                </div>
                                <p className="text-blue-200 mt-3 text-base">Revisa tu progreso y desempeño en el entrenamiento</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowProfileForm((prev) => !prev)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-600 px-6 py-3 font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
                                >
                                    {showProfileForm ? '✕ Cerrar edición' : 'Editar datos'}
                                </button>
                                {flash?.profile_success && (
                                    <span className="text-green-700 bg-green-50 border border-green-300 rounded-lg px-4 py-2 text-sm font-semibold shadow-md">
                                        ✓ {flash.profile_success}
                                    </span>
                                )}
                            </div>
                        </div>

                        {showProfileForm && (
                            <div className="mt-6 border-t border-white/30 pt-6">
                                <h2 className="text-2xl font-bold text-white mb-6">✏️ Editar datos personales</h2>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (validateProfileForm()) {
                                            patchProfile(route('estadisticas.perfil'), {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    resetProfile('password', 'password_confirmation');
                                                    setShowProfileForm(false);
                                                    setProfileValidationErrors({});
                                                },
                                            });
                                        }
                                    }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Nombre *</label>
                                        <input
                                            type="text"
                                            className={`w-full rounded-xl border-2 px-4 py-3 bg-white/90 text-gray-900 focus:border-white focus:ring-2 focus:ring-white/50 transition-all ${profileValidationErrors.name || profileErrors.name ? 'border-red-300' : 'border-white/30'
                                                }`}
                                            value={profileData.name}
                                            onChange={(e) => {
                                                setProfileData('name', e.target.value);
                                                if (profileValidationErrors.name) {
                                                    setProfileValidationErrors((prev) => ({ ...prev, name: '' }));
                                                }
                                            }}
                                        />
                                        {(profileValidationErrors.name || profileErrors.name) && (
                                            <p className="text-sm text-red-200 bg-red-500/30 rounded-lg px-3 py-1 mt-2">{profileValidationErrors.name || profileErrors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Email *</label>
                                        <input
                                            type="email"
                                            className={`w-full rounded-xl border-2 px-4 py-3 bg-white/90 text-gray-900 focus:border-white focus:ring-2 focus:ring-white/50 transition-all ${profileValidationErrors.email || profileErrors.email ? 'border-red-300' : 'border-white/30'
                                                }`}
                                            value={profileData.email}
                                            onChange={(e) => {
                                                setProfileData('email', e.target.value);
                                                if (profileValidationErrors.email) {
                                                    setProfileValidationErrors((prev) => ({ ...prev, email: '' }));
                                                }
                                            }}
                                        />
                                        {(profileValidationErrors.email || profileErrors.email) && (
                                            <p className="text-sm text-red-200 bg-red-500/30 rounded-lg px-3 py-1 mt-2">{profileValidationErrors.email || profileErrors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Teléfono</label>
                                        <input
                                            type="text"
                                            className={`w-full rounded-xl border-2 px-4 py-3 bg-white/90 text-gray-900 focus:border-white focus:ring-2 focus:ring-white/50 transition-all ${profileValidationErrors.telefono ? 'border-red-300' : 'border-white/30'
                                                }`}
                                            value={profileData.telefono}
                                            onChange={(e) => {
                                                setProfileData('telefono', e.target.value);
                                                if (profileValidationErrors.telefono) {
                                                    setProfileValidationErrors((prev) => ({ ...prev, telefono: '' }));
                                                }
                                            }}
                                        />
                                        {profileValidationErrors.telefono && (
                                            <p className="text-sm text-red-200 bg-red-500/30 rounded-lg px-3 py-1 mt-2">{profileValidationErrors.telefono}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Nueva contraseña</label>
                                        <input
                                            type="password"
                                            className={`w-full rounded-xl border-2 px-4 py-3 bg-white/90 text-gray-900 focus:border-white focus:ring-2 focus:ring-white/50 transition-all ${profileValidationErrors.password ? 'border-red-300' : 'border-white/30'
                                                }`}
                                            value={profileData.password}
                                            onChange={(e) => {
                                                setProfileData('password', e.target.value);
                                                if (profileValidationErrors.password) {
                                                    setProfileValidationErrors((prev) => ({ ...prev, password: '' }));
                                                }
                                            }}
                                            placeholder="Dejar en blanco para mantener"
                                        />
                                        {profileValidationErrors.password && (
                                            <p className="text-sm text-red-200 bg-red-500/30 rounded-lg px-3 py-1 mt-2">{profileValidationErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2">Confirmar contraseña</label>
                                        <input
                                            type="password"
                                            className={`w-full rounded-xl border-2 px-4 py-3 bg-white/90 text-gray-900 focus:border-white focus:ring-2 focus:ring-white/50 transition-all ${profileValidationErrors.password_confirmation ? 'border-red-300' : 'border-white/30'
                                                }`}
                                            value={profileData.password_confirmation}
                                            onChange={(e) => {
                                                setProfileData('password_confirmation', e.target.value);
                                                if (profileValidationErrors.password_confirmation) {
                                                    setProfileValidationErrors((prev) => ({ ...prev, password_confirmation: '' }));
                                                }
                                            }}
                                        />
                                        {profileValidationErrors.password_confirmation && (
                                            <p className="text-sm text-red-200 bg-red-500/30 rounded-lg px-3 py-1 mt-2">{profileValidationErrors.password_confirmation}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processingProfile}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-600 px-8 py-3 font-bold shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 transition-all duration-200"
                                        >
                                            Guardar cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Formulario de métricas corporales */}
                    <div className={`mb-8 rounded-2xl shadow-xl p-8 border-2 ${hasMetrics
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {hasMetrics ? 'Empezaste así !!!' : '📊 Tus métricas'}
                                </h2>
                                <p className="text-gray-700 text-base">
                                    {hasMetrics
                                        ? 'Este es tu punto de partida.'
                                        : 'Rellena tus datos iniciales para llevar un seguimiento más preciso.'}
                                </p>
                            </div>
                            {flash?.success && (
                                <span className="text-green-700 bg-green-100 border-2 border-green-300 rounded-xl px-4 py-2 text-sm font-bold shadow-md">
                                    ✓ {flash.success}
                                </span>
                            )}
                        </div>

                        {!hasMetrics ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                post(route('estadisticas.medidas'), {
                                    preserveScroll: true,
                                });
                            }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Peso (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="500"
                                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        value={data.peso_kg}
                                        onChange={(e) => setData('peso_kg', e.target.value)}
                                        placeholder="ej: 75.5"
                                    />
                                    {errors.peso_kg && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1 mt-2">{errors.peso_kg}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Altura (cm)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="50"
                                        max="260"
                                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        value={data.altura_cm}
                                        onChange={(e) => setData('altura_cm', e.target.value)}
                                        placeholder="ej: 180"
                                    />
                                    {errors.altura_cm && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1 mt-2">{errors.altura_cm}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Grasa corporal (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="80"
                                        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        value={data.grasa_corporal_pct}
                                        onChange={(e) => setData('grasa_corporal_pct', e.target.value)}
                                        placeholder="ej: 15.5"
                                    />
                                    {errors.grasa_corporal_pct && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-1 mt-2">{errors.grasa_corporal_pct}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">IMC</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-700"
                                        value={imcCalculado || ''}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                                </div>

                                <div className="md:col-span-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white font-bold shadow-lg hover:shadow-2xl hover:scale-105 disabled:opacity-50 transition-all duration-200"
                                    >
                                        Guardar métricas iniciales
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white/70 rounded-xl p-4 border-2 border-blue-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">⚖️ Peso (kg)</label>
                                    <div className="text-3xl font-bold text-blue-600">{data.peso_kg}</div>
                                </div>

                                <div className="bg-white/70 rounded-xl p-4 border-2 border-blue-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">📏 Altura (cm)</label>
                                    <div className="text-3xl font-bold text-blue-600">{data.altura_cm}</div>
                                </div>

                                <div className="bg-white/70 rounded-xl p-4 border-2 border-blue-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">📊 Grasa corporal (%)</label>
                                    <div className="text-3xl font-bold text-blue-600">{data.grasa_corporal_pct}</div>
                                </div>

                                <div className="bg-white/70 rounded-xl p-4 border-2 border-blue-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">🧮 IMC</label>
                                    <div className="text-3xl font-bold text-blue-600">{imcCalculado || ''}</div>
                                    <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                                </div>

                                <div className="md:col-span-4 flex justify-center pt-2">
                                    <p className="text-sm text-blue-700 font-bold bg-blue-100 px-4 py-2 rounded-xl">🔒 Estos datos no pueden ser modificados</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8 mb-8">
                        <div className="space-y-8">
                            {/* Cards de Estadísticas */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                <Card containerClassName="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-200">
                                    <div className="text-center">
                                        <div className="text-5xl mb-3">📊</div>
                                        <p className="text-blue-100 text-sm font-bold mb-2">Clases asistidas</p>
                                        <p className="text-5xl font-extrabold text-white">
                                            {estadisticasDinamicas.total_clases_tomadas}
                                        </p>
                                    </div>
                                </Card>

                                <Card containerClassName="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-200">
                                    <div className="text-center">
                                        <div className="text-5xl mb-3">🎯</div>
                                        <p className="text-green-100 text-sm font-bold mb-2">Próximas Clases</p>
                                        <p className="text-5xl font-extrabold text-white">
                                            {estadisticasDinamicas.total_clases_reservadas}
                                        </p>
                                    </div>
                                </Card>

                                <Card containerClassName="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-200">
                                    <div className="text-center">
                                        <div className="text-5xl mb-3">⏳</div>
                                        <p className="text-orange-100 text-sm font-bold mb-2">En Lista de Espera</p>
                                        <p className="text-5xl font-extrabold text-white">
                                            {estadisticasDinamicas.en_lista_espera}
                                        </p>
                                    </div>
                                </Card>

                                <Card containerClassName="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-200">
                                    <div className="text-center">
                                        <div className="text-5xl mb-3">📋</div>
                                        <p className="text-purple-100 text-sm font-bold mb-2">Guías Completadas</p>
                                        <p className="text-5xl font-extrabold text-white">
                                            {estadisticasDinamicas.total_guias_completadas}
                                        </p>
                                    </div>
                                </Card>

                                <Card containerClassName="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-200">
                                    <div className="text-center">
                                        <div className="text-5xl mb-3">🌟</div>
                                        <p className="text-indigo-100 text-sm font-bold mb-2">Nivel actual</p>
                                        <p className="text-xl font-extrabold text-white mt-2">
                                            {nivelCondicion}
                                        </p>
                                    </div>
                                </Card>
                            </div>

                            {/* Próximas Clases */}
                            <Card
                                title="📅 Próximas Clases"
                                containerClassName="p-4 bg-white rounded-2xl shadow-xl"
                            >
                                {proximasClasesFiltradas.length > 0 ? (
                                    <div className="space-y-4">
                                        {proximasPage.map((clase) => (
                                            <div
                                                key={clase.id}
                                                className="border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg bg-gradient-to-r from-white to-blue-50 transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                            {clase.nombre}
                                                        </h3>
                                                        <p className="text-gray-600 font-medium text-base mt-1">
                                                            🏋️ {clase.entrenador}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-sm text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-lg">
                                                                📍 {clase.fecha}
                                                            </span>
                                                            <span className="text-sm text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-lg">
                                                                🕐 {clase.hora_inicio} - {clase.hora_fin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        {(() => {
                                                            const tiempo = buildTiempoRestante(clase);

                                                            return (
                                                                <span
                                                                    className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-md ${tiempo.tone}`}
                                                                >
                                                                    {tiempo.label}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {proximasClasesFiltradas.length > pageSize && (
                                            <div className="flex items-center justify-between pt-4 text-sm text-gray-700 font-medium border-t border-gray-200">
                                                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                                                    Mostrando {Math.min((clasesPage - 1) * pageSize + 1, totalProximas)}-
                                                    {Math.min(clasesPage * pageSize, totalProximas)} de {totalProximas}
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setClasesPage((p) => Math.max(1, p - 1))}
                                                        disabled={clasesPage === 1}
                                                        className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${clasesPage === 1
                                                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : 'text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-500'
                                                            }`}
                                                    >
                                                        ← Anterior
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setClasesPage((p) => Math.min(totalProximasPages, p + 1))}
                                                        disabled={clasesPage === totalProximasPages}
                                                        className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${clasesPage === totalProximasPages
                                                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : 'text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-500'
                                                            }`}
                                                    >
                                                        Siguiente →
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                                        <div className="text-6xl mb-4">📅</div>
                                        <p className="text-gray-700 font-semibold text-lg mb-3">No tienes clases próximas reservadas</p>
                                        <Link
                                            href="/clases"
                                            className="text-blue-600 hover:text-blue-800 font-bold text-lg mt-4 inline-block bg-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                                        >
                                            Ver clases disponibles →
                                        </Link>
                                    </div>
                                )}
                            </Card>

                            {/* Gráfico de Clases por Mes */}
                            <Card
                                title="📈 Progreso"
                                containerClassName="bg-white p-5 rounded-2xl shadow-xl"
                                headerAction={
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-700 font-bold">Ver:</label>
                                            <select
                                                value={rangoMeses}
                                                onChange={(e) => setRangoMeses(Number(e.target.value))}
                                                className="rounded-xl border-2 border-gray-300 px-4 py-2 text-sm font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                            >
                                                <option value={12}>Últimos 12 meses</option>
                                                <option value={6}>Últimos 6 meses</option>
                                                <option value={3}>Últimos 3 meses</option>
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                                        >
                                            {showMeasurementForm ? '✕ Cancelar' : '📊 Registrar Medición'}
                                        </button>
                                    </div>
                                }
                            >
                                {showMeasurementForm && (
                                    <div className="mb-6 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl shadow-lg">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            📊 Registro de Medición Corporal
                                        </h3>
                                        <p className="text-gray-700 text-sm mb-5 bg-white/60 rounded-lg p-3 border border-green-200">
                                            {ultimaMedicion
                                                ? `Los campos están pre-rellenados con tus últimos datos registrados (${ultimaMedicion.mes}). Actualízalos con tus medidas actuales.`
                                                : 'Los campos están pre-rellenados con tus datos iniciales. Registra tus medidas actuales.'}
                                        </p>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            router.post(route('mediciones.store'), {
                                                peso_kg: measurementFormData.peso_kg || null,
                                                altura_cm: measurementFormData.altura_cm || null,
                                                grasa_corporal_pct: measurementFormData.grasa_corporal_pct || null,
                                                fecha_medicion: new Date().toISOString().split('T')[0],
                                            }, {
                                                preserveScroll: true,
                                                onSuccess: () => {
                                                    setShowMeasurementForm(false);
                                                    setMeasurementFormData({
                                                        peso_kg: getValorInicial('peso_kg'),
                                                        altura_cm: getValorInicial('altura_cm'),
                                                        grasa_corporal_pct: getValorInicial('grasa_corporal_pct'),
                                                    });
                                                },
                                            });
                                        }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">⚖️ Peso (kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="1"
                                                    max="500"
                                                    className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                                    name="peso_kg"
                                                    value={measurementFormData.peso_kg}
                                                    onChange={(e) => setMeasurementFormData({ ...measurementFormData, peso_kg: e.target.value })}
                                                    placeholder="ej: 75.5"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">📏 Altura (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="50"
                                                    max="260"
                                                    className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                                    name="altura_cm"
                                                    value={measurementFormData.altura_cm}
                                                    onChange={(e) => setMeasurementFormData({ ...measurementFormData, altura_cm: e.target.value })}
                                                    placeholder="ej: 180"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">📊 Grasa corporal (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="80"
                                                    className="w-full rounded-xl border-2 border-green-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                                                    name="grasa_corporal_pct"
                                                    value={measurementFormData.grasa_corporal_pct}
                                                    onChange={(e) => setMeasurementFormData({ ...measurementFormData, grasa_corporal_pct: e.target.value })}
                                                    placeholder="ej: 15.5"
                                                />
                                            </div>

                                            <div className="flex items-end gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    💾 Guardar
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={clasesPorMesFiltradas}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="peso_kg"
                                            stroke="#7c3aed"
                                            name="Peso (kg)"
                                            strokeWidth={2}
                                            dot={{ fill: '#7c3aed' }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="grasa_corporal_pct"
                                            stroke="#f97316"
                                            name="Grasa corporal (%)"
                                            strokeWidth={2}
                                            dot={{ fill: '#f97316' }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="imc"
                                            stroke="#14b8a6"
                                            name="IMC"
                                            strokeWidth={2}
                                            dot={{ fill: '#14b8a6' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>

                            {/* Historial de Clases */}
                            <Card
                                title="📝 Historial de Clases"
                                containerClassName="bg-white p-5 rounded-2xl shadow-xl"
                            >
                                {historialClasesFiltrado.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Clase
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Entrenador
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Fecha
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Hora
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {historialClasesFiltrado.map((clase) => (
                                                    <tr key={clase.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {clase.nombre}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                            {clase.entrenador}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {clase.fecha}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {clase.hora_inicio} - {clase.hora_fin}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                                        <div className="text-6xl mb-4">📝</div>
                                        <p className="text-gray-700 font-semibold text-lg">No hay clases en el historial</p>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Guía Actual / Recomendaciones */}
                        <div>
                            <Card title="📚 Guía" containerClassName="p-5 bg-white rounded-2xl shadow-xl">
                                <p className="text-gray-700 text-sm mb-4 font-medium">Nivel actual: <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg">{nivelCondicion}</span></p>

                                {guiasSemanales.length > 0 && (
                                    <div className="space-y-3 mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Rutinas semanales</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {guiasSemanales.map((g) => (
                                                <div key={g.id} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                                                    <div className="flex items-center justify-between gap-3 mb-3">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            {g.titulo}
                                                        </h3>
                                                        <span className="text-xs font-bold uppercase tracking-wide text-green-800 bg-green-200 px-3 py-1 rounded-full">
                                                            Semanal
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-xs text-gray-600 mb-1">Nivel</p>
                                                            <p className="font-bold text-green-700">{g.nivel}</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-xs text-gray-600 mb-1">Ejercicios</p>
                                                            <p className="font-bold text-green-700">{g.ejercicios_count}</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-xs text-gray-600 mb-1">Faltan</p>
                                                            <p className="font-bold text-orange-600">{g.ejercicios_faltan}</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-xs text-gray-600 mb-1">Completada</p>
                                                            <p className="font-bold text-green-600">{g.veces_completada}x</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
                                                        <p className="text-xs text-gray-600 mb-1">Siguiente ejercicio</p>
                                                        <p className="font-bold text-gray-900">{g.siguiente_ejercicio ?? '—'}</p>
                                                    </div>
                                                    {g.asignada_el && (
                                                        <p className="text-xs text-gray-500 text-center">
                                                            Asignada: {g.asignada_el}
                                                        </p>
                                                    )}
                                                    <Link
                                                        href={`/guias/${g.id}`}
                                                        className="mt-3 block w-full bg-gradient-to-r from-green-600 to-green-600 text-white font-bold py-2 px-4 rounded-xl hover:from-green-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all text-center"
                                                    >
                                                        Ver Guía →
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {guiaActual ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900">Guía asignada</h3>
                                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                {guiaActual.titulo}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="bg-white rounded-lg p-3 border border-purple-200">
                                                    <p className="text-xs text-gray-600 mb-1">Nivel</p>
                                                    <p className="font-bold text-purple-700">{guiaActual.nivel}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-purple-200">
                                                    <p className="text-xs text-gray-600 mb-1">Ejercicios</p>
                                                    <p className="font-bold text-purple-700">{guiaActual.ejercicios_count}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-purple-200">
                                                    <p className="text-xs text-gray-600 mb-1">Faltan</p>
                                                    <p className="font-bold text-orange-600">{guiaActual.ejercicios_faltan}</p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-purple-200">
                                                    <p className="text-xs text-gray-600 mb-1">Completada</p>
                                                    <p className="font-bold text-green-600">{guiaActual.veces_completada}x</p>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-purple-200 mb-3">
                                                <p className="text-xs text-gray-600 mb-1">Siguiente ejercicio</p>
                                                <p className="font-bold text-gray-900">{guiaActual.siguiente_ejercicio ?? '—'}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 text-center">
                                                Asignada: {guiaActual.asignada_el}
                                            </p>

                                            <Link
                                                href={`/guias/${guiaActual.id}`}
                                                className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-center"
                                            >
                                                Ver Guía →
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    guiasSemanales.length === 0 && (
                                        <div className="space-y-4">
                                            <div className="text-gray-700 text-sm bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                                                <p className="font-bold text-yellow-800 mb-2">⚠️ No tienes una guía asignada.</p>
                                                <p className="text-gray-600">Te recomendamos estas opciones según tu nivel:</p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {guiaRecomendadas.length > 0 ? (
                                                    guiaRecomendadas.map((g, idx) => (
                                                        <div key={idx} className="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-xs text-purple-600 mb-1 font-bold">Nivel: {g.nivel}</p>
                                                                    <p className="text-base font-bold text-gray-900">{g.titulo}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">Ejercicios: {g.ejercicios_count}</p>
                                                                </div>
                                                                <Link
                                                                    href={`/guias/${g.id}`}
                                                                    className="text-sm font-bold text-purple-700 hover:text-purple-900 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all"
                                                                >
                                                                    Ver →
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 text-center py-4">No hay recomendaciones disponibles</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
