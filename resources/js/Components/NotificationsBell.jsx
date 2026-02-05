import { Link, router } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
import Modal from "@/Components/Modal";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotificationsBell() {
    const [notificaciones, establecerNotificaciones] = useState([]);
    const [todasLasNotificaciones, establecerTodasLasNotificaciones] = useState([]);
    const [noLeidas, establecerNoLeidas] = useState(0);
    const [mostrarModal, establecerMostrarModal] = useState(false);
    const [cargandoModal, establecerCargandoModal] = useState(false);
    const [paginaActual, establecerPaginaActual] = useState(1);
    const [totalNotificaciones, establecerTotalNotificaciones] = useState(0);
    const porPagina = 5;

    const obtenerNotificaciones = async (limite = 3) => {
        try {
            const { data } = await window.axios.get(route("notifications.index"), {
                params: { limit: limite },
            });
            establecerNotificaciones(data.notifications);
            establecerNoLeidas(data.unread);
        } catch (e) {
            console.error(e);
        }
    };

    const obtenerTodasLasNotificaciones = async (pagina = 1) => {
        establecerCargandoModal(true);
        try {
            const { data } = await window.axios.get(route("notifications.index"), {
                params: { page: pagina },
            });
            establecerTodasLasNotificaciones(data.notifications);
            establecerTotalNotificaciones(data.total);
            establecerPaginaActual(pagina);
        } catch (e) {
            console.error(e);
        } finally {
            establecerCargandoModal(false);
        }
    };

    const manejarMostrarMas = async () => {
        establecerMostrarModal(true);
        await obtenerTodasLasNotificaciones(1);
    };

    useEffect(() => {
        obtenerNotificaciones();
    }, []);

    const marcarComoLeido = async (id) => {
        try {
            await window.axios.post(route("notifications.read", id));
            establecerNotificaciones((anterior) => anterior.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
            establecerTodasLasNotificaciones((anterior) => anterior.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
            establecerNoLeidas((u) => Math.max(0, u - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const eliminarNotificacionesLeidas = async () => {
        if (!confirm('¿Estás seguro de que deseas eliminar todas las notificaciones leídas?')) {
            return;
        }

        establecerCargandoModal(true);
        try {
            await window.axios.post(route("notifications.deleteRead"));
            await obtenerTodasLasNotificaciones(paginaActual);
            await obtenerNotificaciones();
        } catch (e) {
            console.error(e);
        } finally {
            establecerCargandoModal(false);
        }
    };

    const marcarTodasComoLeidas = async () => {
        establecerCargandoModal(true);
        try {
            await window.axios.post(route("notifications.markAllRead"));
            await obtenerTodasLasNotificaciones(paginaActual);
            await obtenerNotificaciones();
        } catch (e) {
            console.error(e);
        } finally {
            establecerCargandoModal(false);
        }
    };

    const aceptarListaEspera = async (notificationId) => {
        try {
            const { data } = await window.axios.post(route("notifications.aceptarListaEspera", notificationId));
            alert(data.message || '¡Reserva confirmada!');
            await obtenerTodasLasNotificaciones(paginaActual);
            await obtenerNotificaciones();
            router.reload({ only: ['horarios', 'proximasClases', 'clases'] });
        } catch (e) {
            alert(e.response?.data?.error || 'Error al aceptar la reserva');
            console.error(e);
        }
    };

    const rechazarListaEspera = async (notificationId) => {
        try {
            const { data } = await window.axios.post(route("notifications.rechazarListaEspera", notificationId));
            alert(data.message || 'Has rechazado la reserva');
            await obtenerTodasLasNotificaciones(paginaActual);
            await obtenerNotificaciones();
            router.reload({ only: ['horarios', 'proximasClases', 'clases'] });
        } catch (e) {
            alert(e.response?.data?.error || 'Error al rechazar la reserva');
            console.error(e);
        }
    };

    return (
        <div className="ms-4">
            <Dropdown>
                <Dropdown.Trigger>
                    <div className="relative">
                        <button className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none">
                            <Bell className="h-5 w-5" />
                            {noLeidas > 0 && (
                                <span className="absolute -top-1 -start-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs w-5 h-5">{noLeidas}</span>
                            )}
                        </button>
                    </div>
                </Dropdown.Trigger>

                <Dropdown.Content align="right" width="80" contentClasses="py-3 bg-white">
                    <div className="p-4 max-h-96 overflow-y-auto">
                        {notificaciones.length === 0 && (
                            <div className="text-sm text-gray-500">No hay notificaciones</div>
                        )}
                        {notificaciones.map((n) => (
                            <div key={n.id} className="flex items-start justify-between gap-2 px-3 py-3 hover:bg-gray-50 rounded">
                                <div className="flex-1">
                                    <div className="text-sm text-gray-800">{n.data.message}</div>
                                    <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>

                                    {n.data.tipo === 'lista_espera_disponible' && !n.read_at && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => aceptarListaEspera(n.id)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                onClick={() => rechazarListaEspera(n.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end">
                                    {!n.read_at && n.data.tipo !== 'lista_espera_disponible' ? (
                                        <button
                                            onClick={() => marcarComoLeido(n.id)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            Marcar como leído
                                        </button>
                                    ) : n.read_at ? (
                                        <span className="text-sm text-gray-400">Leído</span>
                                    ) : null}
                                </div>
                            </div>
                        ))}

                        <div className="mt-2 border-t pt-2">
                            <button
                                onClick={manejarMostrarMas}
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Mostrar más
                            </button>
                        </div>
                    </div>
                </Dropdown.Content>
            </Dropdown>

            <Modal show={mostrarModal} onClose={() => establecerMostrarModal(false)} maxWidth="2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
                    <div>
                        <h3 className="text-xl font-bold">Todas mis notificaciones</h3>
                        <p className="text-sm text-white/90">Mantente al dia de reservas y avisos.</p>
                    </div>
                    <button
                        onClick={() => establecerMostrarModal(false)}
                        className="rounded-full p-2 text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
                        aria-label="Cerrar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 max-h-[28rem] overflow-y-auto bg-slate-50">
                    {cargandoModal ? (
                        <div className="text-center text-slate-500">Cargando...</div>
                    ) : todasLasNotificaciones.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-slate-500">
                            No hay notificaciones
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todasLasNotificaciones.map((n) => (
                                <div
                                    key={n.id}
                                    className="relative flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    {!n.read_at && (
                                        <span className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    )}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-800">{n.data.message}</div>
                                        <div className="mt-1 text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</div>

                                        {n.data.tipo === 'lista_espera_disponible' && (
                                            <span className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                                Lista de espera
                                            </span>
                                        )}

                                        {n.data.tipo === 'lista_espera_disponible' && !n.read_at && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => aceptarListaEspera(n.id)}
                                                    className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                                >
                                                    Aceptar
                                                </button>
                                                <button
                                                    onClick={() => rechazarListaEspera(n.id)}
                                                    className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {!n.read_at && n.data.tipo !== 'lista_espera_disponible' ? (
                                            <button
                                                onClick={() => marcarComoLeido(n.id)}
                                                className="text-sm font-medium text-sky-600 hover:text-sky-700"
                                            >
                                                Marcar como leido
                                            </button>
                                        ) : n.read_at ? (
                                            <span className="text-sm text-slate-400">Leido</span>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 px-6 py-4 border-t bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={marcarTodasComoLeidas}
                                disabled={cargandoModal}
                                className="px-2 py-1 text-sm font-medium rounded text-white bg-sky-600 hover:bg-sky-800 disabled:text-slate-400"
                            >
                                Marcar todas como leidas
                            </button>
                            <button
                                onClick={eliminarNotificacionesLeidas}
                                disabled={cargandoModal}
                                className="px-2 py-1 text-sm font-medium rounded text-white bg-rose-600 hover:bg-rose-800 disabled:text-slate-400"
                            >
                                Eliminar leidas
                            </button>
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                            Pagina {paginaActual} de {Math.ceil(totalNotificaciones / porPagina) || 1}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            onClick={() => obtenerTodasLasNotificaciones(paginaActual - 1)}
                            disabled={paginaActual === 1 || cargandoModal}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => obtenerTodasLasNotificaciones(paginaActual + 1)}
                            disabled={paginaActual >= Math.ceil(totalNotificaciones / porPagina) || cargandoModal}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            Siguiente
                        </button>
                        <button
                            onClick={() => establecerMostrarModal(false)}
                            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
