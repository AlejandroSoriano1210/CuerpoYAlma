import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import NotificationsBell from "@/Components/NotificationsBell";
import { Link, usePage } from "@inertiajs/react";
import { Settings } from "lucide-react";
import { useState } from "react";
import { usaRoleUser } from "@/Hooks/usaRoleUser";

export default function MainNav({ onAuthModal }) {
    const user = usePage().props.auth?.user;
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const openAuthModal = (mode) => {
        if (onAuthModal) {
            onAuthModal(mode);
        }
    };

    const authLinkClassName =
        "inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-gray-300 transition duration-150 ease-in-out hover:border-green-400 hover:text-green-400 focus:border-green-400 focus:text-green-400 focus:outline-none";

    const mobileAuthButtonClassName =
        "flex w-full items-start border-l-4 border-transparent py-2 pe-4 ps-3 text-base font-medium text-gray-600 transition duration-150 ease-in-out hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-300 focus:bg-gray-50 focus:text-gray-800 focus:outline-none";

    const renderAuthRequiredNavItem = (label, routeName) => {
        const href = route(routeName);
        if (user) {
            return (
                <NavLink href={href} active={route().current(routeName)}>
                    {label}
                </NavLink>
            );
        }

        if (!onAuthModal) {
            return null;
        }

        return (
            <button
                type="button"
                onClick={() => openAuthModal("login")}
                className={authLinkClassName}
            >
                {label}
            </button>
        );
    };

    const renderAuthRequiredMobileItem = (label, routeName) => {
        const href = route(routeName);
        if (user) {
            return (
                <ResponsiveNavLink href={href} active={route().current(routeName)}>
                    {label}
                </ResponsiveNavLink>
            );
        }

        if (!onAuthModal) {
            return null;
        }

        return (
            <button
                type="button"
                onClick={() => openAuthModal("login")}
                className={mobileAuthButtonClassName}
            >
                {label}
            </button>
        );
    };

    return (
        <nav className="bg-gray-900 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex">
                        <div className="flex shrink-0 items-center">
                            <Link href="/">
                                <h1 className="text-2xl font-bold text-green-400">
                                    Cuerpo & Alma
                                </h1>
                            </Link>
                        </div>

                        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                            {hasRole("superusuario") && (
                                <NavLink
                                    href={route("entrenadores.index")}
                                    active={route().current("entrenadores.index")}
                                >
                                    Empleados
                                </NavLink>
                            )}
                            {hasRole("superusuario") && (
                                <NavLink
                                    href={route("clientes.index")}
                                    active={route().current("clientes.index")}
                                >
                                    Clientes
                                </NavLink>
                            )}
                            {hasRole("superusuario") && (
                                <NavLink
                                    href={route("ingresos.index")}
                                    active={route().current("ingresos.index")}
                                >
                                    Ingresos
                                </NavLink>
                            )}
                            {hasRole("entrenador") && (
                                <NavLink
                                    href={route("panel.clases.index")}
                                    active={route().current("panel.clases.index")}
                                >
                                    Panel de control
                                </NavLink>
                            )}
                            {hasRole("cliente") && (
                                <NavLink
                                    href={route("estadisticas")}
                                    active={route().current("estadisticas")}
                                >
                                    Estadísticas
                                </NavLink>
                            )}
                            {!hasRole("superusuario") && (
                                <>
                                    {renderAuthRequiredNavItem(
                                        "Clases",
                                        "clases.index"
                                    )}
                                    {renderAuthRequiredNavItem(
                                        "Guías",
                                        "guias.index"
                                    )}
                                    {hasAnyRole(["entrenador", "superusuario"]) && (
                                        <NavLink
                                            href={route("ejercicios.index")}
                                            active={route().current("ejercicios.index")}
                                        >
                                            Ejercicios
                                        </NavLink>
                                    )}
                                </>
                            )}
                            {renderAuthRequiredNavItem(
                                "Máquinas",
                                "maquinas.index"
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ms-6 sm:flex sm:items-center">
                        {user ? (
                            <>
                                <NotificationsBell />

                                {hasRole("superusuario") && (
                                    <div className="ms-3">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    type="button"
                                                    aria-label="Gestion"
                                                    className={
                                                        "inline-flex items-center justify-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-500 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 " +
                                                        (route().current("clases.index") ||
                                                        route().current("guias.index") ||
                                                        route().current("ejercicios.index")
                                                            ? "ring-2 ring-green-500"
                                                            : "")
                                                    }
                                                >
                                                    <Settings className="h-5 w-5" />
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align="right" width="48">
                                                <Dropdown.Link
                                                    href={route("clases.index")}
                                                >
                                                    Clases
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route("guias.index")}
                                                >
                                                    Guías
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route("ejercicios.index")}
                                                >
                                                    Ejercicios
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                )}

                                <div className="relative ms-3 mr-3">
                                    <span className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500">
                                        {user.name}
                                    </span>
                                </div>

                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                >
                                    Cerrar Sesión
                                </Link>
                            </>
                        ) : (
                            onAuthModal && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => openAuthModal("login")}
                                        className="mr-3 px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition font-medium"
                                    >
                                        Iniciar sesión
                                    </button>

                                    <button
                                        onClick={() => openAuthModal("register")}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                                    >
                                        Registrarse
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    <div className="-me-2 flex items-center sm:hidden">
                        <button
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    (previousState) => !previousState
                                )
                            }
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    className={
                                        !showingNavigationDropdown
                                            ? "inline-flex"
                                            : "hidden"
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={
                                        showingNavigationDropdown
                                            ? "inline-flex"
                                            : "hidden"
                                    }
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={
                    (showingNavigationDropdown ? "block" : "hidden") +
                    " sm:hidden"
                }
            >
                <div className="space-y-1 pb-3 pt-2">
                    <ResponsiveNavLink
                        href={route("welcome")}
                        active={route().current("welcome")}
                    >
                        Inicio
                    </ResponsiveNavLink>
                    {hasRole("superusuario") && (
                        <ResponsiveNavLink
                            href={route("entrenadores.index")}
                            active={route().current("entrenadores.index")}
                        >
                            Entrenadores
                        </ResponsiveNavLink>
                    )}
                    {hasRole("superusuario") && (
                        <ResponsiveNavLink
                            href={route("clientes.index")}
                            active={route().current("clientes.index")}
                        >
                            Clientes
                        </ResponsiveNavLink>
                    )}
                    {hasRole("superusuario") && (
                        <ResponsiveNavLink
                            href={route("ingresos.index")}
                            active={route().current("ingresos.index")}
                        >
                            Ingresos
                        </ResponsiveNavLink>
                    )}
                    {hasRole("cliente") && (
                        <ResponsiveNavLink
                            href={route("estadisticas")}
                            active={route().current("estadisticas")}
                        >
                            Estadísticas
                        </ResponsiveNavLink>
                    )}
                    {hasRole("entrenador") && (
                        <ResponsiveNavLink
                            href={route("panel.clases.index")}
                            active={route().current("panel.clases.index")}
                        >
                            Mi Panel
                        </ResponsiveNavLink>
                    )}
                    {renderAuthRequiredMobileItem(
                        "Clases",
                        "clases.index"
                    )}
                    {renderAuthRequiredMobileItem(
                        "Guías",
                        "guias.index"
                    )}
                    {hasAnyRole(["entrenador", "superusuario"]) && (
                        <ResponsiveNavLink
                            href={route("ejercicios.index")}
                            active={route().current("ejercicios.index")}
                        >
                            Ejercicios
                        </ResponsiveNavLink>
                    )}
                    {renderAuthRequiredMobileItem(
                        "Máquinas",
                        "maquinas.index"
                    )}
                </div>

                {user ? (
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                ) : (
                    onAuthModal && (
                        <div className="border-t border-gray-200 pb-4 pt-4 px-4">
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => openAuthModal("login")}
                                    className="w-full rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 transition"
                                >
                                    Iniciar sesión
                                </button>
                                <button
                                    onClick={() => openAuthModal("register")}
                                    className="w-full rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 transition"
                                >
                                    Registrarse
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </nav>
    );
}
