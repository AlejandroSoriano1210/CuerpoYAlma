import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SearchBar from "@/Components/SearchBar";
import EntrenadorCreateModal from "@/Components/EntrenadorCreateModal";
import { Users, RotateCcw } from "lucide-react";

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ESTADO_CONFIG = {
    disponible: {
        label: 'Disponible',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: '✓'
    },
    baja: {
        label: 'De Baja',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: '✕'
    },
    vacaciones: {
        label: 'De Vacaciones',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: '✈'
    }
};

export default function Index({ entrenadores, search: initialSearch, rolFiltro: initialRolFiltro }) {
    const { flash } = usePage().props;
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(entrenadores.length > 0 ? entrenadores[0] : null);
    const [rolFiltro, setRolFiltro] = useState(initialRolFiltro || '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFiltroRol = (nuevoRol) => {
        setRolFiltro(nuevoRol);
        const params = {};
        if (initialSearch) params.search = initialSearch;
        if (nuevoRol) params.rol = nuevoRol;

        router.get(route('entrenadores.index'), params, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const eliminar = (id, name) => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${name}?`)) {
            router.delete(route("entrenadores.destroy", id), {
                onSuccess: () => {
                    // Si el empleado eliminado era el seleccionado, seleccionar el primero disponible
                    if (empleadoSeleccionado?.id === id) {
                        const empleadosRestantes = entrenadores.filter(e => e.id !== id);
                        setEmpleadoSeleccionado(empleadosRestantes.length > 0 ? empleadosRestantes[0] : null);
                    }
                },
                onError: () => {
                    alert("Error al eliminar el empleado");
                },
            });
        }
    };

    const agruparHorariosPorDia = (horarios) => {
        const agrupado = {};
        horarios.forEach(h => {
            if (!agrupado[h.dia_semana]) {
                agrupado[h.dia_semana] = [];
            }
            agrupado[h.dia_semana].push(h);
        });
        return agrupado;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Empleados" />

            <div className="py-12 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                            <Users className="text-green-600" size={36} />
                            Empleados
                        </h1>
                        <p className="text-gray-300">Gestiona a los entrenadores, técnicos y personal del gimnasio</p>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                            {flash.success}
                        </div>
                    )}

                    {/* Barra de búsqueda */}
                    <div className="mb-6">
                        <SearchBar initialSearch={initialSearch} routeName="entrenadores.index" />
                    </div>

                    {/* Filtros y Acciones */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <RotateCcw size={20} className="text-gray-600" />
                                Filtros
                            </h2>
                            <div className="flex gap-3">
                                <Link
                                    href={route("gimnasio-horario.edit")}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2"
                                >
                                    🕐 Horario del Gimnasio
                                </Link>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                                >
                                    + Nuevo Empleado
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="text-sm font-medium text-gray-700">
                                Filtrar por rol:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleFiltroRol('')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        rolFiltro === ''
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Todos {rolFiltro === '' && `(${entrenadores.length})`}
                                </button>
                                <button
                                    onClick={() => handleFiltroRol('entrenador')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        rolFiltro === 'entrenador'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    }`}
                                >
                                    Entrenadores {rolFiltro === 'entrenador' && `(${entrenadores.length})`}
                                </button>
                                <button
                                    onClick={() => handleFiltroRol('tecnico')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        rolFiltro === 'tecnico'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                    }`}
                                >
                                    Técnicos {rolFiltro === 'tecnico' && `(${entrenadores.length})`}
                                </button>
                                <button
                                    onClick={() => handleFiltroRol('limpieza')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        rolFiltro === 'limpieza'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                    }`}
                                >
                                    Limpieza {rolFiltro === 'limpieza' && `(${entrenadores.length})`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {entrenadores.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Panel Izquierdo - Resumen del Empleado */}
                            <div className="lg:col-span-3">
                                <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        Resumen del Empleado
                                    </h2>

                                    {empleadoSeleccionado ? (
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Nombre</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {empleadoSeleccionado.name}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Email</p>
                                                <p className="text-base text-gray-900 break-words">
                                                    {empleadoSeleccionado.email}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                                <p className="text-base text-gray-900">
                                                    {empleadoSeleccionado.telefono || 'No especificado'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Rol</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1
                                                    ${empleadoSeleccionado.rol === 'entrenador' ? 'bg-blue-100 text-blue-800' :
                                                      empleadoSeleccionado.rol === 'tecnico' ? 'bg-green-100 text-green-800' :
                                                      empleadoSeleccionado.rol === 'limpieza' ? 'bg-purple-100 text-purple-800' :
                                                      'bg-gray-100 text-gray-800'}`}>
                                                    {empleadoSeleccionado.rol.charAt(0).toUpperCase() + empleadoSeleccionado.rol.slice(1)}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Estado</p>
                                                {(() => {
                                                    const estado = empleadoSeleccionado.estado_empleado || 'disponible';
                                                    const config = ESTADO_CONFIG[estado];
                                                    return (
                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${config.bgColor} ${config.textColor}`}>
                                                            {config.icon} {config.label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>

                                            <div className="pt-4 border-t">
                                                <Link
                                                    href={route("entrenadores.show", empleadoSeleccionado.id)}
                                                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-2"
                                                >
                                                    Ver Detalles
                                                </Link>
                                                <Link
                                                    href={route("entrenadores.edit", empleadoSeleccionado.id)}
                                                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                                                >
                                                    Editar
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">Selecciona un empleado</p>
                                    )}
                                </div>
                            </div>

                            {/* Panel Central - Lista de Empleados */}
                            <div className="lg:col-span-5">
                                <div className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 border-b">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Lista de Empleados ({entrenadores.length})
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                                        {entrenadores.map((empleado) => (
                                            <div
                                                key={empleado.id}
                                                onClick={() => setEmpleadoSeleccionado(empleado)}
                                                className={`p-4 cursor-pointer transition-colors ${
                                                    empleadoSeleccionado?.id === empleado.id
                                                        ? 'bg-blue-50 border-l-4 border-blue-600'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-semibold text-gray-900 truncate">
                                                            {empleado.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {empleado.email}
                                                        </p>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                                                                ${empleado.rol === 'entrenador' ? 'bg-blue-100 text-blue-800' :
                                                                  empleado.rol === 'tecnico' ? 'bg-green-100 text-green-800' :
                                                                  empleado.rol === 'limpieza' ? 'bg-purple-100 text-purple-800' :
                                                                  'bg-gray-100 text-gray-800'}`}>
                                                                {empleado.rol.charAt(0).toUpperCase() + empleado.rol.slice(1)}
                                                            </span>
                                                            {(() => {
                                                                const estado = empleado.estado_empleado || 'disponible';
                                                                const config = ESTADO_CONFIG[estado];
                                                                return (
                                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                                                                        {config.icon} {config.label}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            eliminar(empleado.id, empleado.name);
                                                        }}
                                                        className="ml-4 text-red-600 hover:text-red-900"
                                                        title="Eliminar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Panel Derecho - Horario de Trabajo */}
                            <div className="lg:col-span-4">
                                <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        Horario de Trabajo
                                    </h2>

                                    {empleadoSeleccionado && empleadoSeleccionado.horario_trabajo.length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(agruparHorariosPorDia(empleadoSeleccionado.horario_trabajo))
                                                .sort(([diaA], [diaB]) => parseInt(diaA) - parseInt(diaB))
                                                .map(([dia, horarios]) => (
                                                    <div key={dia} className="border-l-4 border-blue-500 pl-3 py-2">
                                                        <p className="font-semibold text-gray-900 mb-1">
                                                            {DIAS_SEMANA[parseInt(dia)]}
                                                        </p>
                                                        <div className="space-y-1">
                                                            {horarios.map((h, idx) => (
                                                                <p key={idx} className="text-sm text-gray-700">
                                                                    {h.hora_inicio} - {h.hora_fin}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ) : empleadoSeleccionado ? (
                                        <p className="text-gray-500 text-center py-8">
                                            No tiene horario de trabajo asignado
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">
                                            Selecciona un empleado para ver su horario
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
                            <p className="text-lg">
                                {initialSearch ? 'No se encontraron empleados que coincidan con la búsqueda' : 'No hay empleados registrados'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <EntrenadorCreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => router.reload()}
            />
        </AuthenticatedLayout>
    );
}
