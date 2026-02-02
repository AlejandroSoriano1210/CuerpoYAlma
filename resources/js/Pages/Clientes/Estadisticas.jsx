import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '@/Components/Card';

export default function Dashboard({ user, metricas, proximasClases, historialClases, guiaActual, guiaRecomendadas = [], nivelCondicion = 'Sin datos', estadisticas, clasesPorMes }) {
    const { flash } = usePage().props;

    // Obtener la última medición registrada de clasesPorMes
    const ultimaMedicion = useMemo(() => {
        const medicionesConDatos = clasesPorMes?.filter(m => m.peso_kg || m.grasa_corporal_pct) ?? [];
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

    const hasMetrics = Boolean(metricas?.peso_kg || metricas?.altura_cm || metricas?.grasa_corporal_pct);
    const [clasesPage, setClasesPage] = useState(1);
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [rangoMeses, setRangoMeses] = useState(12);
    const [measurementFormData, setMeasurementFormData] = useState({
        peso_kg: getValorInicial('peso_kg'),
        altura_cm: getValorInicial('altura_cm'),
        grasa_corporal_pct: getValorInicial('grasa_corporal_pct'),
    });
    const pageSize = 3;

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

    const totalProximas = proximasClases?.length ?? 0;
    const totalProximasPages = Math.max(1, Math.ceil(totalProximas / pageSize));
    const proximasPage = useMemo(() => {
        const start = (clasesPage - 1) * pageSize;
        return proximasClases.slice(start, start + pageSize);
    }, [clasesPage, proximasClases]);

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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Encabezado con datos del usuario */}
                    <div className="mb-8 bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-600 mt-2 text-lg">{user.email}</p>
                                <p className="text-gray-500 mt-1">Revisa tu progreso y desempeño en el entrenamiento</p>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de métricas corporales */}
                    <div className={`mb-8 rounded-lg shadow p-6 ${hasMetrics ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {hasMetrics ? 'Empezaste así' : 'Tus métricas'}
                                </h2>
                                <p className="text-gray-600 mt-1 text-sm">
                                    {hasMetrics
                                        ? 'Este es tu punto de partida.'
                                        : 'Rellena tus datos iniciales para llevar un seguimiento más preciso.'}
                                </p>
                            </div>
                            {flash?.success && (
                                <span className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-1 text-sm">
                                    {flash.success}
                                </span>
                            )}
                        </div>

                        {!hasMetrics ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                post(route('estadisticas.medidas'), {
                                    preserveScroll: true,
                                });
                            }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="500"
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        value={data.peso_kg}
                                        onChange={(e) => setData('peso_kg', e.target.value)}
                                        placeholder="ej: 75.5"
                                    />
                                    {errors.peso_kg && <p className="text-sm text-red-600 mt-1">{errors.peso_kg}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="50"
                                        max="260"
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        value={data.altura_cm}
                                        onChange={(e) => setData('altura_cm', e.target.value)}
                                        placeholder="ej: 180"
                                    />
                                    {errors.altura_cm && <p className="text-sm text-red-600 mt-1">{errors.altura_cm}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Grasa corporal (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="80"
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                        value={data.grasa_corporal_pct}
                                        onChange={(e) => setData('grasa_corporal_pct', e.target.value)}
                                        placeholder="ej: 15.5"
                                    />
                                    {errors.grasa_corporal_pct && <p className="text-sm text-red-600 mt-1">{errors.grasa_corporal_pct}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">IMC</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700"
                                        value={imcCalculado || ''}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                                </div>

                                <div className="md:col-span-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Guardar métricas iniciales
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-gray-700 cursor-not-allowed"
                                        value={data.peso_kg}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-gray-700 cursor-not-allowed"
                                        value={data.altura_cm}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Grasa corporal (%)</label>
                                    <input
                                        type="number"
                                        className="mt-1 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-gray-700 cursor-not-allowed"
                                        value={data.grasa_corporal_pct}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">IMC</label>
                                    <input
                                        type="text"
                                        readOnly
                                        disabled
                                        className="mt-1 w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-gray-700 cursor-not-allowed"
                                        value={imcCalculado || ''}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                                </div>

                                <div className="md:col-span-4 flex justify-center pt-2">
                                    <p className="text-sm text-blue-700 font-medium">Estos datos no pueden ser modificados</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cards de Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <Card icon="📊" containerClassName="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Clases asistidas</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">
                                {estadisticas.total_clases_tomadas}
                            </p>
                        </Card>

                        <Card icon="🎯" containerClassName="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Próximas Clases</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {estadisticas.total_clases_reservadas}
                            </p>
                        </Card>

                        <Card icon="⏳" containerClassName="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">En Lista de Espera</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                {estadisticas.en_lista_espera}
                            </p>
                        </Card>

                        <Card icon="📋" containerClassName="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Guías Completadas</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {estadisticas.total_guias_completadas}
                            </p>
                        </Card>

                        <Card containerClassName="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600 text-sm font-medium">Nivel actual</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-2">
                                {nivelCondicion}
                            </p>
                        </Card>
                    </div>

                    {/* Grid: Próximas Clases y Guía Actual */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Próximas Clases */}
                        <div className="lg:col-span-2">
                            <Card
                                title="📅 Próximas Clases"
                                headerAction={
                                    <Link
                                        href="/clases"
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Ver más →
                                    </Link>
                                }
                            >
                                {proximasClases.length > 0 ? (
                                    <div className="space-y-4">
                                        {proximasPage.map((clase) => (
                                            <div
                                                key={clase.id}
                                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {clase.nombre}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            🏋️ {clase.entrenador}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className="text-sm text-gray-600">
                                                                📍 {clase.fecha}
                                                            </span>
                                                            <span className="text-sm text-gray-600">
                                                                🕐 {clase.hora_inicio} - {clase.hora_fin}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        {(() => {
                                                            const tiempo = buildTiempoRestante(clase);

                                                            return (
                                                                <span
                                                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${tiempo.tone}`}
                                                                >
                                                                    {tiempo.label}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {proximasClases.length > pageSize && (
                                            <div className="flex items-center justify-between pt-2 text-sm text-gray-600">
                                                <div>
                                                    Mostrando {Math.min((clasesPage - 1) * pageSize + 1, totalProximas)}-
                                                    {Math.min(clasesPage * pageSize, totalProximas)} de {totalProximas}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setClasesPage((p) => Math.max(1, p - 1))}
                                                        disabled={clasesPage === 1}
                                                        className={`px-3 py-1 rounded border ${clasesPage === 1
                                                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        Anterior
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setClasesPage((p) => Math.min(totalProximasPages, p + 1))}
                                                        disabled={clasesPage === totalProximasPages}
                                                        className={`px-3 py-1 rounded border ${clasesPage === totalProximasPages
                                                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No tienes clases próximas reservadas</p>
                                        <Link
                                            href="/clases"
                                            className="text-blue-600 hover:text-blue-800 font-medium mt-3 inline-block"
                                        >
                                            Ver clases disponibles →
                                        </Link>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Guía Actual / Recomendaciones */}
                        <div>
                            <Card title="📚 Guía">
                                <p className="text-gray-600 text-sm mb-4">Nivel actual: <span className="font-semibold text-purple-700">{nivelCondicion}</span></p>

                                {guiaActual ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {guiaActual.titulo}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-2">
                                                Nivel: <span className="font-medium text-gray-900">{guiaActual.nivel}</span>
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Ejercicios: <span className="font-medium text-gray-900">
                                                    {guiaActual.ejercicios_count}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Faltan: <span className="font-medium text-gray-900">
                                                    {guiaActual.ejercicios_faltan}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Siguiente: <span className="font-medium text-gray-900">
                                                    {guiaActual.siguiente_ejercicio ?? '—'}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Completada: <span className="font-medium text-purple-700">
                                                    {guiaActual.veces_completada} {guiaActual.veces_completada === 1 ? 'vez' : 'veces'}
                                                </span>
                                            </p>
                                            <p className="text-gray-600 text-xs mt-3">
                                                Asignada: {guiaActual.asignada_el}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/guias/${guiaActual.id}`}
                                            className="block w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition text-center"
                                        >
                                            Ver Guía →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-gray-700 text-sm">
                                            <p className="font-semibold">No tienes una guía asignada.</p>
                                            <p className="text-gray-500">Te recomendamos estas opciones según tu nivel:</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {guiaRecomendadas.length > 0 ? (
                                                guiaRecomendadas.map((g, idx) => (
                                                    <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Nivel: <span className="font-semibold text-purple-700">{g.nivel}</span></p>
                                                                <p className="text-lg font-semibold text-gray-900">{g.titulo}</p>
                                                                <p className="text-xs text-gray-500">Ejercicios: {g.ejercicios_count}</p>
                                                            </div>
                                                            <Link
                                                                href={`/guias/${g.id}`}
                                                                className="text-sm font-medium text-purple-700 hover:text-purple-900"
                                                            >
                                                                Ver →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No hay recomendaciones disponibles</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Gráfico de Clases por Mes */}
                    <Card
                        title="📈 Progreso"
                        headerAction={
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Ver:</label>
                                    <select
                                        value={rangoMeses}
                                        onChange={(e) => setRangoMeses(Number(e.target.value))}
                                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                                    >
                                        <option value={12}>Últimos 12 meses</option>
                                        <option value={6}>Últimos 6 meses</option>
                                        <option value={3}>Últimos 3 meses</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                                    className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow hover:bg-green-700 transition"
                                >
                                    {showMeasurementForm ? '✕ Cancelar' : 'Registrar Medición'}
                                </button>
                            </div>
                        }
                        className="mb-8"
                    >
                        {showMeasurementForm && (
                            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro de Medición Corporal</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {ultimaMedicion
                                        ? `Los campos están pre-rellenados con tus datos del mes anterior (${ultimaMedicion.mes}). Actualiza si es necesario.`
                                        : 'Los campos están pre-rellenados con tus datos iniciales. Actualiza tus medidas actuales.'}
                                </p>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    router.post(route('mediciones.store'), {
                                        peso_kg: measurementFormData.peso_kg || null,
                                        altura_cm: measurementFormData.altura_cm || null,
                                        grasa_corporal_pct: measurementFormData.grasa_corporal_pct || null,
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
                                        <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="500"
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                            name="peso_kg"
                                            value={measurementFormData.peso_kg}
                                            onChange={(e) => setMeasurementFormData({ ...measurementFormData, peso_kg: e.target.value })}
                                            placeholder="ej: 75.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="50"
                                            max="260"
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                                            name="altura_cm"
                                            value={measurementFormData.altura_cm}
                                            onChange={(e) => setMeasurementFormData({ ...measurementFormData, altura_cm: e.target.value })}
                                            placeholder="ej: 180"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Grasa corporal (%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="80"
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
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
                                            className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
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
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="cantidad"
                                    stroke="#3b82f6"
                                    name="Clases asistidas"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                />
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
                        headerAction={
                            <Link
                                href="/clases"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Ver más →
                            </Link>
                        }
                    >
                        {historialClases.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Clase
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Entrenador
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hora
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {historialClases.map((clase) => (
                                            <tr key={clase.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {clase.nombre}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {clase.entrenador}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {clase.fecha}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {clase.hora_inicio} - {clase.hora_fin}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No hay clases en el historial</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
