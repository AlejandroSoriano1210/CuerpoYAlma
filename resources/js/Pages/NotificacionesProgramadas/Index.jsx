import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageHeader, FlashMessage, EmptyState, StatusBadge } from "@/Components";
import { Bell, Plus, Send, Trash2, Power, Clock, Users, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import useConfirm from "@/Hooks/useConfirm";

const DESTINATARIOS_LABELS = {
    todos: "Todos los usuarios",
    clientes: "Clientes",
    empleados: "Todos los empleados",
    entrenadores: "Entrenadores",
    tecnicos: "Técnicos",
    limpieza: "Limpieza",
    usuario_especifico: "Usuario específico",
};

const FRECUENCIA_LABELS = {
    diaria: "Diaria",
    semanal: "Semanal",
    mensual: "Mensual",
    anual: "Anual",
};

const DIAS_SEMANA = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
};

export default function Index({ notificaciones, usuarios, filters }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filtroEstado, setFiltroEstado] = useState(filters.estado || "");
    const [filtroTipo, setFiltroTipo] = useState(filters.tipo || "");
    const confirmAction = useConfirm();

    const applyFilters = (overrides = {}) => {
        const params = {
            search: overrides.search ?? searchTerm,
            estado: overrides.estado ?? filtroEstado,
            tipo: overrides.tipo ?? filtroTipo,
        };

        // Eliminar vacíos
        Object.keys(params).forEach((k) => {
            if (!params[k]) delete params[k];
        });

        router.get(route("notificaciones-programadas.index"), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        clearTimeout(window._notifSearchTimer);
        window._notifSearchTimer = setTimeout(() => {
            applyFilters({ search: value });
        }, 400);
    };

    const toggleNotificacion = async (id) => {
        const accepted = await confirmAction("¿Cambiar el estado de esta notificación?");
        if (!accepted) return;

        router.patch(route("notificaciones-programadas.toggle", id), {}, {
            preserveScroll: true,
        });
    };

    const eliminarNotificacion = async (id) => {
        const accepted = await confirmAction("¿Estás seguro de eliminar esta notificación programada?");
        if (!accepted) return;

        router.delete(route("notificaciones-programadas.destroy", id), {
            preserveScroll: true,
        });
    };

    const enviarAhora = async (id) => {
        const accepted = await confirmAction("¿Enviar esta notificación ahora a todos los destinatarios?");
        if (!accepted) return;

        router.post(route("notificaciones-programadas.enviar", id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notificaciones Programadas" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Notificaciones Programadas"
                    description="Gestiona las notificaciones automáticas del sistema"
                    icon={Bell}
                    actions={
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            <Plus size={20} />
                            Nueva Notificación
                        </button>
                    }
                />

                <FlashMessage />

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Búsqueda */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título o mensaje..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => { setSearchTerm(""); applyFilters({ search: "" }); }}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Filtro estado */}
                        <select
                            value={filtroEstado}
                            onChange={(e) => { setFiltroEstado(e.target.value); applyFilters({ estado: e.target.value }); }}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="activa">Activas</option>
                            <option value="inactiva">Inactivas</option>
                        </select>

                        {/* Filtro tipo */}
                        <select
                            value={filtroTipo}
                            onChange={(e) => { setFiltroTipo(e.target.value); applyFilters({ tipo: e.target.value }); }}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="unica_vez">Una sola vez</option>
                            <option value="recurrente">Recurrente</option>
                        </select>
                    </div>
                </div>

                {/* Lista de notificaciones */}
                {notificaciones.data.length === 0 ? (
                    <EmptyState
                        icon={<Bell size={48} />}
                        message="No hay notificaciones programadas"
                        description="Crea tu primera notificación programada para enviar mensajes automáticos a los usuarios."
                        action={
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                Crear notificación
                            </button>
                        }
                    />
                ) : (
                    <div className="space-y-3">
                        {notificaciones.data.map((n) => (
                            <NotificacionCard
                                key={n.id}
                                notificacion={n}
                                expanded={expandedId === n.id}
                                onToggleExpand={() => setExpandedId(expandedId === n.id ? null : n.id)}
                                onToggle={() => toggleNotificacion(n.id)}
                                onDelete={() => eliminarNotificacion(n.id)}
                                onSend={() => enviarAhora(n.id)}
                            />
                        ))}

                        {/* Paginación */}
                        {notificaciones.last_page > 1 && (
                            <div className="mt-6 flex justify-center items-center gap-3">
                                {notificaciones.prev_page_url && (
                                    <button
                                        onClick={() => router.get(notificaciones.prev_page_url, {}, { preserveState: true })}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition"
                                    >
                                        ← Anterior
                                    </button>
                                )}
                                <span className="text-sm text-gray-600">
                                    Página {notificaciones.current_page} de {notificaciones.last_page}
                                </span>
                                {notificaciones.next_page_url && (
                                    <button
                                        onClick={() => router.get(notificaciones.next_page_url, {}, { preserveState: true })}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition"
                                    >
                                        Siguiente →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de crear */}
            {showCreateModal && (
                <CreateNotificacionModal
                    usuarios={usuarios}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function NotificacionCard({ notificacion: n, expanded, onToggleExpand, onToggle, onDelete, onSend }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border ${n.activa ? "border-gray-100" : "border-gray-200 opacity-75"} overflow-hidden transition-all`}>
            {/* Cabecera */}
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={onToggleExpand}>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${n.activa ? "bg-green-500" : "bg-gray-400"}`} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{n.titulo}</h3>
                        <StatusBadge
                            status={n.tipo_envio === "recurrente" ? "recurrente" : "unica_vez"}
                            variant={n.tipo_envio === "recurrente" ? "info" : "purple"}
                            label={n.tipo_envio === "recurrente" ? "Recurrente" : "Una vez"}
                        />
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {DESTINATARIOS_LABELS[n.destinatarios] || n.destinatarios}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{n.mensaje}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {n.proxima_ejecucion && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 hidden sm:flex">
                            <Clock size={14} />
                            {n.proxima_ejecucion}
                        </span>
                    )}
                    {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {/* Detalles expandidos */}
            {expanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Mensaje:</span>
                            <p className="text-gray-600 mt-1">{n.mensaje}</p>
                        </div>
                        {n.url && (
                            <div>
                                <span className="font-medium text-gray-700">URL:</span>
                                <p className="text-gray-600 mt-1">{n.url}</p>
                            </div>
                        )}
                        <div>
                            <span className="font-medium text-gray-700">Destinatarios:</span>
                            <p className="text-gray-600 mt-1">
                                {DESTINATARIOS_LABELS[n.destinatarios]}
                                {n.usuario_destino && ` — ${n.usuario_destino.name}`}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Hora de envío:</span>
                            <p className="text-gray-600 mt-1">{n.hora_envio}</p>
                        </div>
                        {n.tipo_envio === "recurrente" && (
                            <div>
                                <span className="font-medium text-gray-700">Frecuencia:</span>
                                <p className="text-gray-600 mt-1">
                                    {FRECUENCIA_LABELS[n.frecuencia] || n.frecuencia}
                                    {n.frecuencia === "semanal" && n.dia_semana && ` — ${DIAS_SEMANA[n.dia_semana]}`}
                                    {n.frecuencia === "mensual" && n.dia_mes && ` — Día ${n.dia_mes}`}
                                </p>
                            </div>
                        )}
                        {n.fecha_envio && (
                            <div>
                                <span className="font-medium text-gray-700">Fecha de envío:</span>
                                <p className="text-gray-600 mt-1">{n.fecha_envio}</p>
                            </div>
                        )}
                        <div>
                            <span className="font-medium text-gray-700">Última ejecución:</span>
                            <p className="text-gray-600 mt-1">{n.ultima_ejecucion || "Nunca"}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Próxima ejecución:</span>
                            <p className="text-gray-600 mt-1">{n.proxima_ejecucion || "—"}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Creada por:</span>
                            <p className="text-gray-600 mt-1">{n.creador}</p>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={onSend}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            <Send size={14} />
                            Enviar ahora
                        </button>
                        <button
                            onClick={onToggle}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
                                n.activa
                                    ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                                    : "bg-green-100 hover:bg-green-200 text-green-800"
                            }`}
                        >
                            <Power size={14} />
                            {n.activa ? "Desactivar" : "Activar"}
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition"
                        >
                            <Trash2 size={14} />
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CreateNotificacionModal({ usuarios, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        titulo: "",
        mensaje: "",
        url: "",
        destinatarios: "todos",
        usuario_id: "",
        tipo_envio: "unica_vez",
        frecuencia: "",
        dia_semana: "1",
        dia_mes: "1",
        hora_envio: "08:00",
        fecha_envio: "",
        enviar_ahora: false,
    });

    const [searchUsuario, setSearchUsuario] = useState("");

    const usuariosFiltrados = usuarios.filter(
        (u) =>
            u.name.toLowerCase().includes(searchUsuario.toLowerCase()) ||
            u.email.toLowerCase().includes(searchUsuario.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("notificaciones-programadas.store"), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell size={24} className="text-green-600" />
                        Nueva Notificación Programada
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Título <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.titulo}
                                onChange={(e) => setData("titulo", e.target.value)}
                                placeholder="Ej: Recordatorio de mediciones mensuales"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.titulo ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mensaje <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.mensaje}
                                onChange={(e) => setData("mensaje", e.target.value)}
                                rows={3}
                                placeholder="El mensaje que recibirán los usuarios..."
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.mensaje ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.mensaje && <p className="text-red-500 text-sm mt-1">{errors.mensaje}</p>}
                        </div>

                        {/* URL (opcional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL (opcional)</label>
                            <input
                                type="text"
                                value={data.url}
                                onChange={(e) => setData("url", e.target.value)}
                                placeholder="/estadisticas"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Destinatarios */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Destinatarios <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.destinatarios}
                                onChange={(e) => setData("destinatarios", e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.destinatarios ? "border-red-500" : "border-gray-300"}`}
                            >
                                {Object.entries(DESTINATARIOS_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                            {errors.destinatarios && <p className="text-red-500 text-sm mt-1">{errors.destinatarios}</p>}
                        </div>

                        {/* Selector de usuario específico */}
                        {data.destinatarios === "usuario_especifico" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Seleccionar usuario <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    value={searchUsuario}
                                    onChange={(e) => setSearchUsuario(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                                />
                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                                    {usuariosFiltrados.length === 0 ? (
                                        <p className="text-gray-500 text-sm p-3">No se encontraron usuarios</p>
                                    ) : (
                                        usuariosFiltrados.map((u) => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => { setData("usuario_id", u.id); setSearchUsuario(u.name); }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 transition ${
                                                    data.usuario_id === u.id ? "bg-green-100 font-medium" : ""
                                                }`}
                                            >
                                                <span className="font-medium">{u.name}</span>
                                                <span className="text-gray-500 ml-2">{u.email}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                                {errors.usuario_id && <p className="text-red-500 text-sm mt-1">{errors.usuario_id}</p>}
                            </div>
                        )}

                        {/* Tipo de envío */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de envío <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                                    data.tipo_envio === "unica_vez" ? "border-green-500 bg-green-50" : "border-gray-200"
                                }`}>
                                    <input
                                        type="radio"
                                        name="tipo_envio"
                                        value="unica_vez"
                                        checked={data.tipo_envio === "unica_vez"}
                                        onChange={(e) => setData("tipo_envio", e.target.value)}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Una sola vez</span>
                                        <p className="text-xs text-gray-500">Se envía en la fecha y hora indicada</p>
                                    </div>
                                </label>
                                <label className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                                    data.tipo_envio === "recurrente" ? "border-green-500 bg-green-50" : "border-gray-200"
                                }`}>
                                    <input
                                        type="radio"
                                        name="tipo_envio"
                                        value="recurrente"
                                        checked={data.tipo_envio === "recurrente"}
                                        onChange={(e) => setData("tipo_envio", e.target.value)}
                                        className="text-green-600 focus:ring-green-500"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">Recurrente</span>
                                        <p className="text-xs text-gray-500">Se repite según la frecuencia</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Campos para envío único */}
                        {data.tipo_envio === "unica_vez" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de envío <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.fecha_envio}
                                        onChange={(e) => setData("fecha_envio", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.fecha_envio ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.fecha_envio && <p className="text-red-500 text-sm mt-1">{errors.fecha_envio}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora de envío <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.hora_envio}
                                        onChange={(e) => setData("hora_envio", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.hora_envio ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.hora_envio && <p className="text-red-500 text-sm mt-1">{errors.hora_envio}</p>}
                                </div>
                            </div>
                        )}

                        {/* Campos para envío recurrente */}
                        {data.tipo_envio === "recurrente" && (
                            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Frecuencia <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.frecuencia}
                                        onChange={(e) => setData("frecuencia", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.frecuencia ? "border-red-500" : "border-gray-300"}`}
                                    >
                                        <option value="">Seleccionar frecuencia</option>
                                        {Object.entries(FRECUENCIA_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.frecuencia && <p className="text-red-500 text-sm mt-1">{errors.frecuencia}</p>}
                                </div>

                                {data.frecuencia === "semanal" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana</label>
                                        <select
                                            value={data.dia_semana}
                                            onChange={(e) => setData("dia_semana", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {Object.entries(DIAS_SEMANA).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {data.frecuencia === "mensual" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Día del mes</label>
                                        <select
                                            value={data.dia_mes}
                                            onChange={(e) => setData("dia_mes", e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {Array.from({ length: 31 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>Día {i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hora de envío <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={data.hora_envio}
                                        onChange={(e) => setData("hora_envio", e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.hora_envio ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.hora_envio && <p className="text-red-500 text-sm mt-1">{errors.hora_envio}</p>}
                                </div>
                            </div>
                        )}

                        {/* Enviar ahora */}
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <input
                                type="checkbox"
                                id="enviar_ahora"
                                checked={data.enviar_ahora}
                                onChange={(e) => setData("enviar_ahora", e.target.checked)}
                                className="rounded text-green-600 focus:ring-green-500"
                            />
                            <label htmlFor="enviar_ahora" className="text-sm text-gray-700">
                                <span className="font-medium">Enviar ahora también</span>
                                <span className="block text-xs text-gray-500">
                                    Además de programarla, envía la notificación de inmediato
                                </span>
                            </label>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition flex items-center gap-2"
                            >
                                {processing ? (
                                    "Guardando..."
                                ) : (
                                    <>
                                        <Bell size={16} />
                                        Crear Notificación
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
