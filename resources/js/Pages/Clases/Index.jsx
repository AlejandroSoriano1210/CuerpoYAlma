import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usaRoleUser } from "@/Hooks/usaRoleUser";
import Calendario from "@/Components/Calendario";

export default function ClasesIndex({ horarios, mes, ano, mesNombre, filtros }) {
    const { hasRole } = usaRoleUser();
    const { auth, flash } = usePage().props;
    const [selectedDate, setSelectedDate] = useState(null);
    const [isReservando, setIsReservando] = useState(null); // Track which class is reserving
    const [isCancelando, setIsCancelando] = useState(null); // Track which reservation is canceling
    const [diasSemana, setDiasSemana] = useState(filtros?.dias_semana || []);
    const [momento, setMomento] = useState(filtros?.momento || "");
    const diasSemanaOptions = [
        { value: 1, label: "Lunes" },
        { value: 2, label: "Martes" },
        { value: 3, label: "Miércoles" },
        { value: 4, label: "Jueves" },
        { value: 5, label: "Viernes" },
        { value: 6, label: "Sábado" },
    ];

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoAnterior = mes === 1 ? ano - 1 : ano;

    const mesSiguiente = mes === 12 ? 1 : mes + 1;
    const anoSiguiente = mes === 12 ? ano + 1 : ano;

    useEffect(() => {
        setDiasSemana(filtros?.dias_semana || []);
        setMomento(filtros?.momento || "");
        setSelectedDate(null);
    }, [filtros]);

    const buildParams = (overrides = {}) => {
        const params = {
            mes: overrides.mes ?? mes,
            ano: overrides.ano ?? ano,
        };

        const dias = overrides.diasSemana ?? diasSemana;
        const mom = overrides.momento ?? momento;

        if (dias?.length) params.dias_semana = dias;
        if (mom) params.momento = mom;

        return params;
    };

    const pushFiltros = (overrides = {}) => {
        router.get(route('clases.index'), buildParams(overrides), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const limpiarFiltros = () => {
        setDiasSemana([]);
        setMomento("");
        setSelectedDate(null);
        pushFiltros({ diasSemana: [], momento: '' });
    };

    const horariosFiltrados = useMemo(() => {
        return horarios.filter((h) => {
            if (diasSemana?.length) {
                const fecha = new Date(h.fecha.substring(0, 10));
                const dow = fecha.getDay() === 0 ? 7 : fecha.getDay(); // ISO 1..7
                if (!diasSemana.includes(dow)) return false;
            }

            if (momento === 'manana' && h.hora_inicio >= '14:00:00') return false;
            if (momento === 'tarde' && h.hora_inicio < '14:00:00') return false;

            return true;
        });
    }, [horarios, diasSemana, momento]);

    const clasesDelDia = selectedDate
        ? horariosFiltrados
            .filter((h) => h.fecha.substring(0, 10) === selectedDate)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
        : [];

    const canEdit = (clase) => {
        return auth.user.id === clase.entrenador_id || hasRole("superusuario");
    };

    const yaInscrito = (clase) => {
        return clase.reservado === true;
    };

    const enListaEspera = (clase) => {
        return clase.en_lista_espera === true;
    };

    const handleReserva = (clase) => {
        if (confirm('¿Deseas reservar un lugar en esta clase?')) {
            setIsReservando(clase.id);
            router.post(
                route('reservas.store'),
                { horario_clase_id: clase.id },
                {
                    onSuccess: () => {
                        setIsReservando(null);
                        // Reload data to reflect reservation state
                        router.reload();
                    },
                    onError: () => {
                        setIsReservando(null);
                        alert('Error al realizar la reserva');
                    },
                }
            );
        }
    };

    const handleCancelarReserva = (clase) => {
        if (!clase.reserva_id) {
            alert('Reserva no encontrada.');
            return;
        }

        if (confirm('¿Deseas cancelar tu reserva en esta clase?')) {
            setIsCancelando(clase.reserva_id);

            router.patch(
                route('reservas.cancelar', clase.reserva_id),
                {},
                {
                    onSuccess: () => {
                        setIsCancelando(null);
                        router.reload();
                    },
                    onError: () => {
                        setIsCancelando(null);
                        alert('Error al cancelar la reserva');
                    },
                }
            );
        }
    };

    const handleCancelarListaEspera = (clase) => {
        if (!clase.lista_espera_id) {
            alert('No estás en la lista de espera.');
            return;
        }

        if (confirm('¿Deseas cancelar tu lugar en la lista de espera?')) {
            setIsCancelando(clase.lista_espera_id);

            router.patch(
                route('lista-espera.cancelar', clase.lista_espera_id),
                {},
                {
                    onSuccess: () => {
                        setIsCancelando(null);
                        router.reload();
                    },
                    onError: () => {
                        setIsCancelando(null);
                        alert('Error al cancelar');
                    },
                }
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Clases" />

            <div className="py-12">
                <div className="mx-52 px-2 sm:px-6 lg:px-8">

                    {/* Header con navegación de meses */}
                    <div className="mb-6 flex justify-between items-center">
                        <Link
                            href={route('clases.index', buildParams({ mes: mesAnterior, ano: anoAnterior }))}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            ← Anterior
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Calendario de Clases - {mesNombre} {ano}
                        </h1>

                        <Link
                            href={route('clases.index', buildParams({ mes: mesSiguiente, ano: anoSiguiente }))}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Siguiente →
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Filtros</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {diasSemanaOptions.map((d) => (
                                        <label key={d.value} className="inline-flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                checked={diasSemana.includes(d.value)}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...diasSemana, d.value]
                                                        : diasSemana.filter((v) => v !== d.value);
                                                    setDiasSemana(next);
                                                    pushFiltros({ diasSemana: next });
                                                }}
                                            />
                                            <span>{d.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Momento</label>
                                  <select
                                      value={momento}
                                      onChange={(e) => {
                                          const value = e.target.value;
                                          setMomento(value);
                                          pushFiltros({ momento: value });
                                      }}
                                    className="w-full rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">Todos</option>
                                    <option value="manana">Mañana</option>
                                    <option value="tarde">Tarde</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={limpiarFiltros}
                                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded"
                                      disabled={(!diasSemana || diasSemana.length === 0) && !momento}
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botón crear clase */}
                    <div className="mb-6 text-right">
                        {!hasRole('cliente') && (
                            <Link
                                href={route('clases.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
                            >
                                + Crear Clase
                            </Link>
                        )}
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {flash.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Calendario */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow p-3">
                            <Calendario
                                mes={mes}
                                ano={ano}
                                horarios={horariosFiltrados}
                                onSelectDate={setSelectedDate}
                                selectedDate={selectedDate}
                            />
                        </div>

                        {/* Panel lateral con clases del día */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {selectedDate
                                    ? new Date(selectedDate).toLocaleDateString("es-ES", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "Selecciona una fecha"}
                            </h2>

                            <div className="space-y-4">
                                {clasesDelDia.length > 0 ? (
                                    clasesDelDia.map((clase) => (
                                        <div
                                            key={clase.id}
                                            className={`p-4 rounded-lg border-2 ${
                                                clase.completa
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-green-300 bg-green-50"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        {clase.nombre || clase.nombre_clase}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Entrenador: {clase.entrenador}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-3">
                                                <p>⏰ {clase.hora_inicio} - {clase.hora_fin}</p>
                                                <p>
                                                    👥 {clase.inscritos}/{clase.capacidad}{" "}
                                                    inscritos
                                                </p>
                                            </div>

                                            {/* Botones de acción */}
                                            <div className="space-y-2">
                                                <Link
                                                    href={route("clases.show", clase.id)}
                                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
                                                >
                                                    Ver Detalles
                                                </Link>

                                                {/* Botón de reserva - para clases con espacios disponibles */}
                                                {!clase.completa && !yaInscrito(clase) && !enListaEspera(clase) && (
                                                    <button
                                                        onClick={() => handleReserva(clase)}
                                                        disabled={isReservando === clase.id}
                                                        className="block w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-center text-sm"
                                                    >
                                                        {isReservando === clase.id
                                                            ? "Reservando..."
                                                            : "Reservar"}
                                                    </button>
                                                )}

                                                {/* Botón cancelar reserva (si ya inscrito) */}
                                                {yaInscrito(clase) && (
                                                    <button
                                                        onClick={() => handleCancelarReserva(clase)}
                                                        disabled={isCancelando === clase.reserva_id}
                                                        className="block w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-center text-sm"
                                                    >
                                                        {isCancelando === clase.reserva_id ? 'Cancelando...' : 'Cancelar Reserva'}
                                                    </button>
                                                )}

                                                {/* Botón de lista de espera - para clases completas sin reserva */}
                                                {clase.completa && !yaInscrito(clase) && !enListaEspera(clase) && (
                                                    <button
                                                        onClick={() => handleReserva(clase)}
                                                        disabled={isReservando === clase.id}
                                                        className="block w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-center text-sm"
                                                    >
                                                        {isReservando === clase.id ? 'Procesando...' : '⏳ Lista de Espera'}
                                                    </button>
                                                )}

                                                {/* Botón cancelar de lista de espera */}
                                                {enListaEspera(clase) && !yaInscrito(clase) && (
                                                    <div className="space-y-1">
                                                        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-center text-xs font-bold">
                                                            ⏳ Pos. {clase.posicion_lista_espera}/{clase.lista_espera_count}
                                                        </div>
                                                        <button
                                                            onClick={() => handleCancelarListaEspera(clase)}
                                                            disabled={isCancelando === clase.lista_espera_id}
                                                            className="block w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded text-center text-sm"
                                                        >
                                                            {isCancelando === clase.lista_espera_id ? 'Cancelando...' : 'Cancelar Lista'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Editar/Eliminar - solo para propietario o admin */}
                                                {canEdit(clase) && (
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route(
                                                                "clases.edit",
                                                                clase.id
                                                            )}
                                                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-center text-sm"
                                                        >
                                                            Editar
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        "¿Estás seguro de que deseas eliminar esta clase?"
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        route(
                                                                            "clases.destroy",
                                                                            clase.id
                                                                        ),
                                                                        {},
                                                                        {
                                                                            onSuccess: () => {
                                                                                // El mensaje flash se muestra automáticamente
                                                                            },
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay clases en esta fecha
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
