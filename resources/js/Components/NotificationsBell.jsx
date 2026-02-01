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
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-xl font-bold">Todas mis notificaciones</h3>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                    {cargandoModal ? (
                        <div className="text-center text-gray-500">Cargando...</div>
                    ) : todasLasNotificaciones.length === 0 ? (
                        <div className="text-center text-gray-500">No hay notificaciones</div>
                    ) : (
                        <div className="space-y-3">
                            {todasLasNotificaciones.map((n) => (
                                <div key={n.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100">
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
                                                className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                                            >
                                                Marcar como leído
                                            </button>
                                        ) : n.read_at ? (
                                            <span className="text-sm text-gray-400 whitespace-nowrap">Leído</span>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="flex gap-2">
                        <button
                            onClick={marcarTodasComoLeidas}
                            disabled={cargandoModal}
                            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                        >
                            Marcar todas como leídas
                        </button>
                        <button
                            onClick={eliminarNotificacionesLeidas}
                            disabled={cargandoModal}
                            className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400"
                        >
                            Eliminar leídas
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Página {paginaActual} de {Math.ceil(totalNotificaciones / porPagina) || 1}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => obtenerTodasLasNotificaciones(paginaActual - 1)}
                            disabled={paginaActual === 1 || cargandoModal}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 rounded"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => obtenerTodasLasNotificaciones(paginaActual + 1)}
                            disabled={paginaActual >= Math.ceil(totalNotificaciones / porPagina) || cargandoModal}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 rounded"
                        >
                            Siguiente
                        </button>
                        <button
                            onClick={() => establecerMostrarModal(false)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
