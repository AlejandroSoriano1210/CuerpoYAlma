import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PanelIndex({ clases, mes, ano, mesNombre }) {
    const { auth } = usePage().props;
    const [estadoActual, setEstadoActual] = useState(auth.user.estado_empleado || 'disponible');
    const [cambiandoEstado, setCambiandoEstado] = useState(false);

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoAnterior = mes === 1 ? ano - 1 : ano;

    const mesSiguiente = mes === 12 ? 1 : mes + 1;
    const anoSiguiente = mes === 12 ? ano + 1 : ano;

    // Verificar si el mes anterior es anterior al mes actual
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1; // getMonth() devuelve 0-11
    const anoActual = hoy.getFullYear();

    const esMesPasado = (mesComparar, anoComparar) => {
        if (anoComparar < anoActual) return true;
        if (anoComparar === anoActual && mesComparar < mesActual) return true;
        return false;
    };

    const puedeVerMesAnterior = !esMesPasado(mesAnterior, anoAnterior);

    const estadoConfig = {
        disponible: {
            label: 'Disponible',
            color: 'green',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            icon: '✓'
        },
        baja: {
            label: 'De Baja',
            color: 'red',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            icon: '✕'
        },
        vacaciones: {
            label: 'De Vacaciones',
            color: 'blue',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            icon: '✈'
        }
    };

    const cambiarEstado = (nuevoEstado) => {
        if (nuevoEstado === estadoActual) return;

        setCambiandoEstado(true);

        router.post(route('panel.cambiarEstado'),
            { estado: nuevoEstado },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEstadoActual(nuevoEstado);
                },
                onError: (errors) => {
                    console.error('Error:', errors);
                },
                onFinish: () => {
                    setCambiandoEstado(false);
                }
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Panel de Entrenador" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white">Mi Panel de Entrenador</h1>
                            <p className="text-gray-300 mt-2">Gestiona tus clases, listas de espera y reservas</p>
                        </div>

                        {/* Selector de Estado */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-sm text-gray-600 mb-2">Mi Estado:</div>
                            <div className="flex gap-2">
                                {Object.entries(estadoConfig).map(([estado, config]) => (
                                    <button
                                        key={estado}
                                        onClick={() => cambiarEstado(estado)}
                                        disabled={cambiandoEstado}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                                            estadoActual === estado
                                                ? `${config.bgColor} ${config.textColor} ring-2 ring-${config.color}-500`
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } ${cambiandoEstado ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {config.icon} {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navegación de meses */}
                    <div className="mb-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
                        {puedeVerMesAnterior ? (
                            <Link
                                href={route('panel.clases.index', { mes: mesAnterior, ano: anoAnterior })}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                            >
                                ← Anterior
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
                            >
                                ← Anterior
                            </button>
                        )}

                        <h2 className="text-2xl font-bold text-gray-900">
                            {mesNombre} {ano}
                        </h2>

                        <Link
                            href={route('panel.clases.index', { mes: mesSiguiente, ano: anoSiguiente })}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Siguiente →
                        </Link>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-gray-600 text-sm font-medium">CLASES ESTE MES</div>
                            <div className="text-4xl font-bold text-blue-600 mt-2">{clases.length}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-gray-600 text-sm font-medium">EN LISTA DE ESPERA</div>
                            <div className="text-4xl font-bold text-amber-600 mt-2">
                                {clases.reduce((sum, c) => sum + c.lista_espera_count, 0)}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-gray-600 text-sm font-medium">CLASES COMPLETAS</div>
                            <div className="text-4xl font-bold text-red-600 mt-2">
                                {clases.filter(c => c.completa).length}
                            </div>
                        </div>
                    </div>

                    {/* Lista de clases */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Mis Clases</h3>
                        </div>

                        {clases.length > 0 ? (
                            <div className="divide-y">
                                {clases.map((clase) => {
                                    // Determinar si la clase es pasada
                                    const fechaClase = new Date(clase.fecha);
                                    const horaFin = clase.hora_fin.split(':');
                                    fechaClase.setHours(parseInt(horaFin[0]), parseInt(horaFin[1]));

                                    const ahora = new Date();
                                    const clasePasada = fechaClase < ahora;

                                    return (
                                        <div
                                            key={clase.id}
                                            className={`p-6 transition cursor-pointer ${
                                                clasePasada
                                                    ? 'opacity-60 bg-gray-50 hover:bg-gray-100'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => router.visit(route('panel.clases.show', clase.id))}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className={`text-lg font-bold ${
                                                            clasePasada ? 'text-gray-500' : 'text-gray-900'
                                                        }`}>{clase.nombre}</h4>
                                                        {clasePasada && (
                                                            <span className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded-full font-semibold">
                                                                Pasada
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>
                                                        📅 {new Date(clase.fecha).toLocaleDateString('es-ES', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className={`text-sm ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>
                                                        ⏰ {clase.hora_inicio} - {clase.hora_fin}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`text-3xl font-bold ${
                                                        clasePasada
                                                            ? 'text-gray-400'
                                                            : clase.completa ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {clase.inscritos}/{clase.capacidad}
                                                    </div>
                                                    <p className={`text-xs mt-1 ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>inscritos</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`p-3 rounded ${clasePasada ? 'bg-gray-100' : 'bg-blue-50'}`}>
                                                    <p className={`text-xs ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>Espacios</p>
                                                    <p className={`text-lg font-bold ${clasePasada ? 'text-gray-400' : 'text-blue-600'}`}>
                                                        {Math.max(0, clase.capacidad - clase.inscritos)}
                                                    </p>
                                                </div>
                                                <div className={`p-3 rounded ${
                                                    clasePasada
                                                        ? 'bg-gray-100'
                                                        : clase.lista_espera_count > 0 ? 'bg-amber-50' : 'bg-gray-50'
                                                }`}>
                                                    <p className={`text-xs ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>Lista de Espera</p>
                                                    <p className={`text-lg font-bold ${
                                                        clasePasada
                                                            ? 'text-gray-400'
                                                            : clase.lista_espera_count > 0 ? 'text-amber-600' : 'text-gray-400'
                                                    }`}>
                                                        {clase.lista_espera_count} {clase.lista_espera_count === 1 ? 'persona' : 'personas'}
                                                    </p>
                                                </div>
                                            </div>

                                            {clase.descripcion && (
                                                <p className={`text-sm mt-3 italic ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>{clase.descripcion}</p>
                                            )}

                                            <div className="mt-4">
                                                <Link
                                                    href={route('panel.clases.show', clase.id)}
                                                    className={`inline-block font-bold py-2 px-4 rounded transition ${
                                                        clasePasada
                                                            ? 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (clasePasada) e.preventDefault();
                                                    }}
                                                >
                                                    Ver Detalles
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-gray-500 text-lg">No tienes clases programadas este mes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
