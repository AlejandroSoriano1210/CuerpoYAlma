import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, usePage, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { usaRoleUser } from "@/Hooks/usaRoleUser";
import Calendario from "@/Components/Calendario";
import { Calendar, RotateCcw, X, CalendarDays, AlertTriangle, Clock, Users } from "lucide-react";
import { validarRequerido } from "@/Utils/validations";

export default function ClasesIndex({ horarios, mes, ano, mesNombre, filtros, entrenadores, tiposClases = [] }) {
    const { hasRole, hasAnyRole } = usaRoleUser();
    const { auth, flash } = usePage().props;
    const [selectedDate, setSelectedDate] = useState(null);
    const [isReservando, setIsReservando] = useState(null); // Track which class is reserving
    const [isCancelando, setIsCancelando] = useState(null); // Track which reservation is canceling
    const [tipoClaseSeleccionado, setTipoClaseSeleccionado] = useState(filtros?.tipo_clase || '');
    const [tiposClasesLocal, setTiposClasesLocal] = useState(tiposClases);
    const [nuevoTipoClase, setNuevoTipoClase] = useState('');
    const [momento, setMomento] = useState(filtros?.momento || "");
    const [modoCrear, setModoCrear] = useState(false); // Estado para modo crear clase
    const [touched, setTouched] = useState({
        nombre: false,
        capacidad: false,
        fecha: false,
        hora_inicio: false,
        hora_fin: false,
        user_id: false,
    });

    // Obtener mes y año actual
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1;
    const anoActual = ahora.getFullYear();
    const esMesActual = mes === mesActual && ano === anoActual;

    // Form para crear clase
    const { data, setData, post, processing, reset } = useForm({
        nombre: '',
        capacidad: 10,
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        descripcion: '',
        tipo_clase: '',
        user_id: '',
        semanal: false,
    });

    // Validaciones en tiempo real
    const nombreError = validarRequerido(data.nombre, 'Nombre de la clase');
    const capacidadError = !data.capacidad || data.capacidad < 1 || data.capacidad > 50
        ? 'La capacidad debe estar entre 1 y 50'
        : true;

    // Validar fecha
    let fechaError = validarRequerido(data.fecha, 'Fecha');
    if (fechaError === true && data.fecha) {
        const fechaSeleccionada = new Date(data.fecha);
        fechaSeleccionada.setHours(0, 0, 0, 0);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaSeleccionada <= hoy) {
            fechaError = 'La fecha debe ser futura (no puede ser hoy ni un día anterior)';
        }
    }

    const horaInicioError = validarRequerido(data.hora_inicio, 'Hora de inicio');

    // Validar hora fin
    let horaFinError = validarRequerido(data.hora_fin, 'Hora de fin');
    if (horaFinError === true && data.hora_inicio && data.hora_fin) {
        const horaInicioMinutos = parseInt(data.hora_inicio.split(':')[0]) * 60 + parseInt(data.hora_inicio.split(':')[1]);
        const horaFinMinutos = parseInt(data.hora_fin.split(':')[0]) * 60 + parseInt(data.hora_fin.split(':')[1]);
        if (horaFinMinutos <= horaInicioMinutos) {
            horaFinError = 'La hora de fin debe ser posterior a la hora de inicio';
        }
    }

    // Validar entrenador si es superusuario o jefe de entrenadores
    let entrenadorError = true;
    if (hasAnyRole(['superusuario', 'jefe_entrenadores'])) {
        if (!data.user_id || data.user_id === '') {
            entrenadorError = 'Debes seleccionar un entrenador';
        } else if (data.user_id && data.hora_inicio && data.hora_fin && data.fecha) {
            const entrenador = entrenadores.find(et => et.id == data.user_id);
            if (entrenador && entrenador.horarios && entrenador.horarios.length > 0) {
                // Obtener día de la semana de la fecha seleccionada
                const fechaObj = new Date(data.fecha + 'T00:00:00');
                const diaDelDia = fechaObj.getDay();
                const diaSemana = diaDelDia === 0 ? 7 : diaDelDia;

                const horaInicioMinutos = parseInt(data.hora_inicio.split(':')[0]) * 60 + parseInt(data.hora_inicio.split(':')[1]);
                const horaFinMinutos = parseInt(data.hora_fin.split(':')[0]) * 60 + parseInt(data.hora_fin.split(':')[1]);

                // Buscar si el entrenador tiene horario para ese día
                const tieneHorarioDia = entrenador.horarios.some(horario => {
                    if (horario.dia_semana !== diaSemana) return false;

                    // Parsear el rango de horarios del entrenador desde el campo 'rangos'
                    const rangos = horario.rangos.split(',').map(r => r.trim());
                    return rangos.some(rango => {
                        const [inicio, fin] = rango.split('-').map(h => {
                            const [horas, minutos] = h.trim().split(':').map(Number);
                            return horas * 60 + minutos;
                        });
                        // Verificar que la clase esté dentro del rango
                        return horaInicioMinutos >= inicio && horaFinMinutos <= fin;
                    });
                });

                if (!tieneHorarioDia) {
                    entrenadorError = 'El horario de la clase no está dentro del horario de trabajo del entrenador seleccionado';
                }
            }
        }
    }
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoAnterior = mes === 1 ? ano - 1 : ano;

    const mesSiguiente = mes === 12 ? 1 : mes + 1;
    const anoSiguiente = mes === 12 ? ano + 1 : ano;

    useEffect(() => {
        setTipoClaseSeleccionado(filtros?.tipo_clase || '');
        setMomento(filtros?.momento || "");
        setSelectedDate(null);
    }, [filtros]);

    useEffect(() => {
        setTiposClasesLocal((prev) => {
            const merged = [...new Set([...(tiposClases || []), ...(prev || [])])];
            return merged;
        });
    }, [tiposClases]);

    const handleAgregarTipoClase = () => {
        const limpio = nuevoTipoClase.trim();
        if (!limpio) return;
        setTiposClasesLocal((prev) => (prev.includes(limpio) ? prev : [...prev, limpio]));
        setData('tipo_clase', limpio);
        setNuevoTipoClase('');
    };

    const handleSelectDateForCreation = (fecha) => {
        setSelectedDate(fecha);
        if (modoCrear) {
            setData('fecha', fecha);
        }
    };

    const handleToggleModoCrear = () => {
        if (modoCrear) {
            // Salir del modo crear
            setModoCrear(false);
            setSelectedDate(null);
            reset();
            setTouched({
                nombre: false,
                capacidad: false,
                fecha: false,
                hora_inicio: false,
                hora_fin: false,
                user_id: false,
            });
        } else {
            // Entrar en modo crear
            setModoCrear(true);
            setSelectedDate(null);
        }
    };

    const handleSubmitForm = (e) => {
        e.preventDefault();

        // Validar todos los campos
        if (nombreError !== true) {
            setTouched(prev => ({ ...prev, nombre: true }));
            return;
        }

        if (capacidadError !== true) {
            setTouched(prev => ({ ...prev, capacidad: true }));
            return;
        }

        if (fechaError !== true) {
            setTouched(prev => ({ ...prev, fecha: true }));
            return;
        }

        if (horaInicioError !== true) {
            setTouched(prev => ({ ...prev, hora_inicio: true }));
            return;
        }

        if (horaFinError !== true) {
            setTouched(prev => ({ ...prev, hora_fin: true }));
            return;
        }

        // Validar entrenador si es superusuario o jefe de entrenadores
        if (hasAnyRole(['superusuario', 'jefe_entrenadores']) && entrenadorError !== true) {
            setTouched(prev => ({ ...prev, user_id: true }));
            return;
        }

        post(route('clases.store'), {
            onSuccess: (response) => {
                console.log('Clase creada exitosamente:', response);
                setModoCrear(false);
                setSelectedDate(null);
                reset();
                setTouched({
                    nombre: false,
                    capacidad: false,
                    fecha: false,
                    hora_inicio: false,
                    hora_fin: false,
                    user_id: false,
                });
                // Recargar la página para ver la nueva clase
                router.get(window.location.href);
            },
            onError: (errors) => {
                console.log('Error al crear clase:', errors);
                // Mostrar el primer error disponible
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    alert('Error: ' + firstError);
                }
            },
        });
    };

    const entrenadorSeleccionado = useMemo(() => {
        if (!data.user_id || !entrenadores) return null;
        return entrenadores.find(et => et.id == data.user_id);
    }, [data.user_id, entrenadores]);

    const buildParams = (overrides = {}) => {
        const params = {
            mes: overrides.mes ?? mes,
            ano: overrides.ano ?? ano,
        };

        const tipo = overrides.tipo_clase ?? tipoClaseSeleccionado;
        const mom = overrides.momento ?? momento;

        if (tipo) params.tipo_clase = tipo;
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
        setTipoClaseSeleccionado('');
        setMomento("");
        setSelectedDate(null);
        pushFiltros({ tipo_clase: '', momento: '' });
    };

    const horariosFiltrados = useMemo(() => {
        return horarios.filter((h) => {
            if (momento === 'manana' && h.hora_inicio >= '14:00:00') return false;
            if (momento === 'tarde' && h.hora_inicio < '14:00:00') return false;

            return true;
        });
    }, [horarios, momento]);

    const horariosParaCalendario = useMemo(() => {
        return horariosFiltrados.filter((h) => {
            const fechaClase = new Date(h.fecha);
            const horaFin = h.hora_fin.substring(0, 5).split(':');
            fechaClase.setHours(parseInt(horaFin[0]), parseInt(horaFin[1]));
            return fechaClase >= new Date();
        });
    }, [horariosFiltrados]);

    const clasesDelDia = selectedDate
        ? horariosFiltrados
            .filter((h) => h.fecha.substring(0, 10) === selectedDate)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
        : [];

    const canEdit = (clase) => {
        return auth.user.id === clase.entrenador_id || hasAnyRole(["superusuario", "jefe_entrenadores"]);
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

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3 mb-2">
                            <Calendar className="text-green-600 flex-shrink-0" size={32} />
                            <span>Calendario de Clases</span>
                        </h1>
                        <p className="text-sm sm:text-base text-gray-300 mt-2">Explora, reserva y gestiona tus clases de entrenamiento</p>
                    </div>

                    {/* Navegación de meses */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => router.get(route('clases.index', buildParams({ mes: mesAnterior, ano: anoAnterior })), {
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                })}
                                disabled={esMesActual}
                                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition text-sm sm:text-base"
                            >
                                ← Anterior
                            </button>

                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
                                {mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} {ano}
                            </h2>

                            <Link
                                href={route('clases.index', buildParams({ mes: mesSiguiente, ano: anoSiguiente }))}
                                className="w-full sm:w-auto text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm sm:text-base"
                            >
                                Siguiente →
                            </Link>
                        </div>
                    </div>

                    {/* Botón crear clase y mensajes flash */}
                    <div className="mb-6 space-y-4">
                        {!hasRole('cliente') && (
                            <div className="text-center sm:text-right">
                                <button
                                    onClick={handleToggleModoCrear}
                                    className={`w-full sm:w-auto ${modoCrear
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                        } text-white font-bold py-2 px-4 sm:px-6 rounded-lg transition text-sm sm:text-base`}
                                >
                                    {modoCrear ? <><X className="w-4 h-4 inline" /> Cancelar</> : '+ Nueva Clase'}
                                </button>
                            </div>
                        )}

                        {flash?.success && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm sm:text-base">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
                                {flash.error}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                        {/* Filtros a la izquierda */}
                        <div className="md:col-span-1 lg:col-span-1 h-fit bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <RotateCcw size={20} className="text-gray-600 flex-shrink-0" />
                                Filtros
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Clase</label>
                                    <select
                                        value={tipoClaseSeleccionado}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setTipoClaseSeleccionado(value);
                                            pushFiltros({ tipo_clase: value });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    >
                                        <option value="">Todas las clases</option>
                                        {tiposClases.map((tipo) => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Momento del día</label>
                                    <select
                                        value={momento}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setMomento(value);
                                            pushFiltros({ momento: value });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                    >
                                        <option value="">Todos los horarios</option>
                                        <option value="manana">Mañana (antes de 14:00)</option>
                                        <option value="tarde">Tarde (14:00 en adelante)</option>
                                    </select>
                                </div>

                                <button
                                    onClick={limpiarFiltros}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!tipoClaseSeleccionado && !momento}
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>

                        {/* Calendario en el centro */}
                        <div className="md:col-span-1 lg:col-span-3 h-fit bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-x-auto">
                            <Calendario
                                mes={mes}
                                ano={ano}
                                horarios={horariosParaCalendario}
                                onSelectDate={handleSelectDateForCreation}
                                selectedDate={selectedDate}
                                mostrarSoloTotal={modoCrear}
                            />
                        </div>

                        {/* Panel lateral con clases del día o formulario a la derecha */}
                        <div className="lg:col-span-1 w-fit bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            {modoCrear ? (
                                // Formulario de creación de clase
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4"> Nueva Clase</h2>

                                    <form onSubmit={handleSubmitForm}>
                                        {/* Nombre */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre de la Clase
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                onBlur={() => setTouched({ ...touched, nombre: true })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${touched.nombre && nombreError !== true
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300'
                                                    }`}
                                                placeholder="Yoga, Pilates, Zumba..."
                                            />
                                            {touched.nombre && nombreError !== true && (
                                                <p className="text-red-500 text-sm mt-1">{nombreError}</p>
                                            )}
                                        </div>

                                        {/* Capacidad */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Capacidad
                                            </label>
                                            <input
                                                type="number"
                                                value={data.capacidad}
                                                onChange={(e) => setData('capacidad', e.target.value)}
                                                onBlur={() => setTouched({ ...touched, capacidad: true })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${touched.capacidad && capacidadError !== true
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300'
                                                    }`}
                                                min="1"
                                                max="50"
                                            />
                                            {touched.capacidad && capacidadError !== true && (
                                                <p className="text-red-500 text-sm mt-1">{capacidadError}</p>
                                            )}
                                        </div>

                                        {/* Tipo de Clase */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tipo de Clase
                                            </label>
                                            <select
                                                value={data.tipo_clase}
                                                onChange={(e) => setData('tipo_clase', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                            >
                                                <option value="">Seleccionar tipo o crear nuevo...</option>
                                                {tiposClasesLocal.map((tipo) => (
                                                    <option key={tipo} value={tipo}>{tipo}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">O crea un tipo nuevo:</p>
                                            <div className="flex gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="Yoga, Pilates, Zumba, etc."
                                                    value={nuevoTipoClase}
                                                    onChange={(e) => setNuevoTipoClase(e.target.value)}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleAgregarTipoClase}
                                                className="mt-3 px-2 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                                            >
                                                Crear tipo
                                            </button>
                                        </div>

                                        {/* Fecha */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Fecha
                                            </label>
                                            <input
                                                type="date"
                                                value={data.fecha}
                                                onChange={(e) => setData('fecha', e.target.value)}
                                                onBlur={() => setTouched({ ...touched, fecha: true })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${touched.fecha && fechaError !== true
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300'
                                                    }`}
                                            />
                                            {touched.fecha && fechaError !== true && (
                                                <p className="text-red-500 text-sm mt-1">{fechaError}</p>
                                            )}
                                            {selectedDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Fecha seleccionada: {new Date(selectedDate).toLocaleDateString("es-ES")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Hora Inicio */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hora Inicio
                                            </label>
                                            <input
                                                type="time"
                                                value={data.hora_inicio}
                                                onChange={(e) => setData('hora_inicio', e.target.value)}
                                                onBlur={() => setTouched({ ...touched, hora_inicio: true })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${touched.hora_inicio && horaInicioError !== true
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300'
                                                    }`}
                                            />
                                            {touched.hora_inicio && horaInicioError !== true && (
                                                <p className="text-red-500 text-sm mt-1">{horaInicioError}</p>
                                            )}
                                        </div>

                                        {/* Hora Fin */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Hora Fin
                                            </label>
                                            <input
                                                type="time"
                                                value={data.hora_fin}
                                                onChange={(e) => setData('hora_fin', e.target.value)}
                                                onBlur={() => setTouched({ ...touched, hora_fin: true })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${touched.hora_fin && horaFinError !== true
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-300'
                                                    }`}
                                            />
                                            {touched.hora_fin && horaFinError !== true && (
                                                <p className="text-red-500 text-sm mt-1">{horaFinError}</p>
                                            )}
                                        </div>

                                        {entrenadores && entrenadores.length > 0 && hasAnyRole(['superusuario', 'jefe_entrenadores']) && (
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Entrenador</label>
                                                <select
                                                    value={data.user_id}
                                                    onChange={(e) => setData('user_id', e.target.value)}
                                                    onBlur={() => setTouched({ ...touched, user_id: true })}
                                                    className={`w-full px-3 py-2 border rounded-lg ${touched.user_id && entrenadorError !== true
                                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                            : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">-- Seleccionar --</option>
                                                    {entrenadores.map((et) => (
                                                        <option key={et.id} value={et.id}>{et.name}</option>
                                                    ))}
                                                </select>
                                                {touched.user_id && entrenadorError !== true && (
                                                    <p className="text-red-500 text-sm mt-1">{entrenadorError}</p>
                                                )}

                                                {/* Mostrar horario del entrenador seleccionado */}
                                                {entrenadorSeleccionado && entrenadorSeleccionado.horarios.length > 0 && (
                                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                            <CalendarDays className="w-4 h-4 inline" /> Horario de {entrenadorSeleccionado.name}
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {entrenadorSeleccionado.horarios.map((horario, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm text-gray-700 bg-white px-3 py-2 rounded">
                                                                    <span className="font-medium">{horario.dia}:</span>
                                                                    <span className="text-gray-600">{horario.horarios}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {entrenadorSeleccionado && entrenadorSeleccionado.horarios.length === 0 && (
                                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <p className="text-sm text-yellow-800">
                                                            <AlertTriangle className="w-4 h-4 inline" /> Este entrenador no tiene horario de trabajo asignado
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Clase semanal */}
                                        <div className="mb-6">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={data.semanal}
                                                    onChange={(e) => setData('semanal', e.target.checked)}
                                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Crear clase semanal
                                                </span>
                                            </label>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition text-m"
                                            >
                                                {processing ? 'Guardando...' : 'Crear clase'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleToggleModoCrear}
                                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                // Panel de clases del día
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-200">
                                        {selectedDate
                                            ? new Date(selectedDate).toLocaleDateString("es-ES", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })
                                            : "Selecciona una fecha"}
                                    </h2>

                                    <div className="space-y-3">
                                        {clasesDelDia.length > 0 ? (
                                            clasesDelDia.map((clase) => {
                                                // Determinar si la clase es pasada
                                                const fechaClase = new Date(clase.fecha);
                                                const horaFin = clase.hora_fin.substring(0, 5).split(':');
                                                fechaClase.setHours(parseInt(horaFin[0]), parseInt(horaFin[1]));

                                                const ahora = new Date();
                                                const clasePasada = fechaClase < ahora;

                                                return (
                                                    <div
                                                        key={clase.id}
                                                        className={`p-4 rounded-lg border-2 transition ${clasePasada
                                                            ? 'opacity-60 border-gray-300 bg-gray-50'
                                                            : clase.completa
                                                                ? 'border-red-300 bg-red-50'
                                                                : 'border-green-300 bg-green-50'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className={`font-bold ${clasePasada ? 'text-gray-500' : 'text-gray-900'
                                                                        }`}>
                                                                        {clase.nombre || clase.nombre_clase}
                                                                    </h3>
                                                                    {clasePasada && (
                                                                        <span className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded-full font-semibold">
                                                                            Pasada
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {clase.tipo_clase && (
                                                                    <p className={`text-xs ${clasePasada ? 'text-gray-500' : 'text-gray-600'} mb-1`}>
                                                                        <span className="font-semibold">Tipo:</span> {clase.tipo_clase}
                                                                    </p>
                                                                )}
                                                                <p className={`text-sm ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>
                                                                    Entrenador: {clase.entrenador}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className={`text-sm mb-3 ${clasePasada ? 'text-gray-500' : 'text-gray-600'}`}>
                                                            <p><Clock className="w-3.5 h-3.5 inline" /> {clase.hora_inicio.substring(0, 5)} - {clase.hora_fin.substring(0, 5)}</p>
                                                            <p>
                                                                <Users className="w-3.5 h-3.5 inline" /> {clase.inscritos}/{clase.capacidad}{" "}
                                                                inscritos
                                                            </p>
                                                        </div>

                                                        {/* Botones de acción */}
                                                        <div className="space-y-2">
                                                            <Link
                                                                href={route("clases.show", clase.id)}
                                                                className={`block w-full font-bold py-2 px-4 rounded text-center text-sm transition ${clasePasada
                                                                    ? 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed'
                                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                    }`}
                                                                onClick={(e) => {
                                                                    if (clasePasada) e.preventDefault();
                                                                }}
                                                            >
                                                                Ver Detalles
                                                            </Link>

                                                            {!clasePasada && (
                                                                <>
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
                                                                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-center text-sm"
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
                                                                                                    // El mensaje flash se muestra solo
                                                                                                },
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                                                                            >
                                                                                Eliminar
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">
                                                No hay clases en esta fecha
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
