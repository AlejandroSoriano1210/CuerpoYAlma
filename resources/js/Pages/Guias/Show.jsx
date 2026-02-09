import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usaRoleUser } from '@/Hooks/usaRoleUser';
import { BackLink, FlashMessage, StatusBadge } from '@/Components';
import { Check, X } from 'lucide-react';

export default function Show({ guia, clientes = [], isAssigned = false, isAssignedWeekly = false }) {
    const { hasAnyRole } = usaRoleUser();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState('');
    const [asignacionSemanal, setAsignacionSemanal] = useState(false);
    const [progreso, setProgreso] = useState({});
    const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
    const [cargandoProgreso, setCargandoProgreso] = useState(true);
    const [animacionCelebracion, setAnimacionCelebracion] = useState(false);
    const [imagenActiva, setImagenActiva] = useState(null);

    // Cargar progreso al montar el componente
    useEffect(() => {
        if (isAssigned) {
            window.axios.get(route('guias.get-progress', guia.id))
                .then(res => {
                    setProgreso(res.data.progreso || {});
                    setCargandoProgreso(false);
                })
                .catch(err => {
                    console.error('Error cargando progreso:', err);
                    setCargandoProgreso(false);
                });
        }
    }, [isAssigned]);

    // Función para guardar el progreso de un ejercicio
    const manejarCambioCheckbox = (guiaEjercicioId, completado) => {
        setCargandoProgreso(true);

        window.axios.post(route('guias.save-progress', guia.id), {
            guia_ejercicio_id: guiaEjercicioId,
            completado: completado,
        })
            .then(res => {
                const data = res.data;
                if (data.success) {
                    // Actualizar el estado local del progreso
                    setProgreso(prev => ({
                        ...prev,
                        [guiaEjercicioId]: completado,
                    }));

                    // Si la guía se completó, mostrar celebración
                    if (data.guiaCompletada) {
                        setMostrarCelebracion(true);
                        setAnimacionCelebracion(true);

                        // Limpiar el progreso y desasignar la guía después de 1.5 segundos
                        setTimeout(() => {
                            setProgreso({});
                            router.delete(route('guias.unassign', guia.id), {
                                data: { keep_weekly: data.asignacionSemanal },
                            });
                        }, 1500);
                    }
                }
                setCargandoProgreso(false);
            })
            .catch(err => {
                console.error('Error guardando progreso:', err);
                setCargandoProgreso(false);
            });
    };

    const manejarEliminar = () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta guía?')) {
            router.delete(route('guias.destroy', guia.id));
        }
    };

    const manejarCompletar = () => {
        if (confirm('¿Marcar esta guía como completada? Se eliminará de tu panel de estadísticas.')) {
            router.delete(route('guias.unassign', guia.id), {
                data: { keep_weekly: isAssignedWeekly },
            });
        }
    };

    const manejarAsignarCliente = (e) => {
        e.preventDefault();
        if (!clienteSeleccionadoId) {
            alert('Por favor selecciona un cliente');
            return;
        }
        router.post(route('guias.assign-to-client', guia.id), {
            client_id: clienteSeleccionadoId,
            semanal: asignacionSemanal,
        });
        setMostrarModal(false);
        setClienteSeleccionadoId('');
        setAsignacionSemanal(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title={guia.titulo} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <BackLink href={route('guias.index')} text="Volver a Guías" />

                    <FlashMessage />

                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{guia.titulo}</h1>
                        <p className="text-sm text-gray-600 mb-4">
                            Nivel: <StatusBadge status={guia.nivel} variant="info" />
                        </p>

                        {guia.contenido ? (
                            <div className="prose max-w-none text-gray-800">
                                <p>{guia.contenido}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500">Sin contenido.</p>
                        )}

                        {/* Lista de ejercicios */}
                        {((guia.guia_ejercicio && guia.guia_ejercicio.length > 0) || (guia.guiaEjercicio && guia.guiaEjercicio.length > 0)) && (
                            <div className="mt-6 pt-6 border-t">
                                <h2 className="text-2xl font-bold mb-4">Ejercicios</h2>
                                <div className="space-y-4">
                                    {(guia.guia_ejercicio ?? guia.guiaEjercicio ?? []).map((g) => (
                                        <div key={g.id} className={`bg-gray-50 p-4 rounded border transition-all ${progreso[g.id] ? 'bg-green-50 border-green-300' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                {isAssigned && !hasAnyRole(['entrenador', 'superusuario']) && (
                                                    <input
                                                        type="checkbox"
                                                        checked={progreso[g.id] ?? false}
                                                        onChange={(e) => manejarCambioCheckbox(g.id, e.target.checked)}
                                                        disabled={cargandoProgreso}
                                                        className="mt-1 w-5 h-5 cursor-pointer"
                                                    />
                                                )}
                                                {g.ejercicio?.imagen_url && (
                                                    <img
                                                        src={g.ejercicio.imagen_url}
                                                        alt={`Foto de ${g.ejercicio.nombre}`}
                                                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-zoom-in"
                                                        onClick={() => setImagenActiva({
                                                            url: g.ejercicio.imagen_url,
                                                            nombre: g.ejercicio.nombre,
                                                        })}
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-lg ${progreso[g.id] ? 'line-through text-gray-500' : ''}`}>
                                                        {g.ejercicio.nombre}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{g.series} series × {g.repeticiones} repeticiones</p>
                                                    {g.instrucciones && <p className="mt-2 text-gray-700">{g.instrucciones}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3 flex-wrap">
                            <a
                                href={route('guias.downloadPdf', guia.id)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center gap-2"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Descargar PDF
                            </a>
                            {!hasAnyRole(['entrenador', 'superusuario']) && (
                                <>
                                    {!isAssigned ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    router.post(route('guias.assign', guia.id));
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Asignar guía a mi dashboard
                                            </button>
                                            <button
                                                onClick={() => {
                                                    router.post(route('guias.assign', guia.id), { semanal: true });
                                                }}
                                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Asignar semanalmente
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={manejarCompletar}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            {isAssignedWeekly ? <><Check className="w-4 h-4 inline" /> Completar semana</> : <><Check className="w-4 h-4 inline" /> Marcar como completada</>}
                                        </button>
                                    )}
                                </>
                            )}
                            {hasAnyRole(['entrenador', 'superusuario']) && (
                                <>
                                    <button
                                        onClick={() => setMostrarModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Asignar a cliente
                                    </button>
                                    <Link href={route('guias.edit', guia.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                                        Editar
                                    </Link>
                                    <button onClick={manejarEliminar} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                        Eliminar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para asignar a cliente */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Asignar guía a cliente</h2>

                        <form onSubmit={manejarAsignarCliente}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un cliente</label>
                                <select
                                    value={clienteSeleccionadoId}
                                    onChange={(e) => setClienteSeleccionadoId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Selecciona un cliente --</option>
                                    {clientes.map((cliente) => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.name} ({cliente.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 flex items-center gap-2">
                                <input
                                    id="asignacion-semanal"
                                    type="checkbox"
                                    checked={asignacionSemanal}
                                    onChange={(e) => setAsignacionSemanal(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="asignacion-semanal" className="text-sm text-gray-700">
                                    Asignar semanalmente (reinicio cada lunes)
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Asignar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarModal(false);
                                        setClienteSeleccionadoId('');
                                        setAsignacionSemanal(false);
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Celebración */}
            {mostrarCelebracion && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <div className={`bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center transition-all ${animacionCelebracion ? 'transform scale-110 opacity-100' : 'transform scale-100 opacity-100'}`}>
                        <h2 className="text-3xl font-bold text-green-600 mb-2">¡Enhorabuena!</h2>
                        <p className="text-lg text-gray-700 mb-6">
                            Has completado la guía <strong>{guia.titulo}</strong>
                        </p>
                        <p className="text-sm text-gray-600 mb-6">
                            Se eliminará de tu dashboard automáticamente...
                        </p>
                        <button
                            onClick={() => setMostrarCelebracion(false)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de imagen */}
            {imagenActiva && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
                    onClick={() => setImagenActiva(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{imagenActiva.nombre}</h3>
                            <button
                                type="button"
                                onClick={() => setImagenActiva(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <img
                            src={imagenActiva.url}
                            alt={`Foto de ${imagenActiva.nombre}`}
                            className="w-full max-h-[80vh] object-contain rounded"
                        />
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
