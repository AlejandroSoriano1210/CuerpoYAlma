import React from "react";
import Dropdown from "@/Components/Dropdown";
import { Head, Link, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Card from "@/Components/Card";
import { Dumbbell, Users, BookOpen } from "lucide-react";
import { usaRoleUser } from "@/Hooks/usaRoleUser";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import NotificationsBell from "@/Components/NotificationsBell";
import AuthModal from "@/Components/AuthModal";

export default function Welcome({ auth }) {
    const user = usePage().props.auth?.user;
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        React.useState(false);
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [authMode, setAuthMode] = React.useState('login');

    return (
        <>
            <Head title="Bienvenido" />

            <div className="bg-gray-900">
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
                                            active={route().current(
                                                "entrenadores.index"
                                            )}
                                        >
                                            Empleados
                                        </NavLink>
                                    )}
                                    {hasRole("superusuario") && (
                                        <NavLink
                                            href={route("clientes.index")}
                                            active={route().current(
                                                "clientes.index"
                                            )}
                                        >
                                            Clientes
                                        </NavLink>
                                    )}
                                    {hasRole('entrenador') && (
                                        <NavLink
                                            href={route("panel.clases.index")}
                                            active={route().current("panel.clases.index")}
                                        >
                                            Panel de control
                                        </NavLink>
                                    )}
                                    {user ? (
                                        <NavLink
                                            href={route("clases.index")}
                                            active={route().current("clases.index")}
                                        >
                                            Clases
                                        </NavLink>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAuthMode('login');
                                                setShowAuthModal(true);
                                            }}
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-gray-300 transition duration-150 ease-in-out hover:border-green-400 hover:text-green-400 focus:border-green-400 focus:text-green-400 focus:outline-none"
                                        >
                                            Clases
                                        </button>
                                    )}
                                    {user ? (
                                        <NavLink
                                            href={route("guias.index")}
                                            active={route().current("guias.index")}
                                        >
                                            Guías
                                        </NavLink>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAuthMode('login');
                                                setShowAuthModal(true);
                                            }}
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-gray-300 transition duration-150 ease-in-out hover:border-green-400 hover:text-green-400 focus:border-green-400 focus:text-green-400 focus:outline-none"
                                        >
                                            Guías
                                        </button>
                                    )}
                                    {hasAnyRole(['entrenador', 'superusuario']) && (
                                        <NavLink
                                            href={route("ejercicios.index")}
                                            active={route().current("ejercicios.index")}
                                        >
                                            Ejercicios
                                        </NavLink>
                                    )}
                                    {user ? (
                                        <NavLink
                                            href={route("maquinas.index")}
                                            active={route().current("maquinas.index")}
                                        >
                                            Máquinas
                                        </NavLink>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAuthMode('login');
                                                setShowAuthModal(true);
                                            }}
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-gray-300 transition duration-150 ease-in-out hover:border-green-400 hover:text-green-400 focus:border-green-400 focus:text-green-400 focus:outline-none"
                                        >
                                            Máquinas
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                {user ? (
                                    <>
                                        <NotificationsBell />

                                        <div className="relative ms-3">
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
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                setAuthMode('login');
                                                setShowAuthModal(true);
                                            }}
                                            className="px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition font-medium"
                                        >
                                            Iniciar sesión
                                        </button>

                                        <button
                                            onClick={() => {
                                                setAuthMode('register');
                                                setShowAuthModal(true);
                                            }}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                                        >
                                            Registrarse
                                        </button>
                                    </div>
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
                </nav>
                <div
                    className="relative h-[70vh] bg-cover bg-center flex items-center justify-center"
                    style={{
                        backgroundImage: "url('/images/hero-gym.jpg')",
                        backgroundAttachment: "fixed",
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

                    <div className="relative text-center px-6">
                        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg animate-fadeIn text-white">
                            Cuerpo & Alma Fitness
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-gray-200">
                            Transforma tu cuerpo. Fortalece tu alma.
                        </p>

                        {!auth.user && (
                            <div className="mt-8">
                                <button
                                    onClick={() => {
                                        setAuthMode('register');
                                        setShowAuthModal(true);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-lg md:text-xl font-bold shadow-lg hover:shadow-2xl inline-block"
                                >
                                    Únete Ahora
                                </button>
                            </div>
                        )}

                        {auth.user && hasRole("cliente") && (
                            <div className="mt-8">
                                <Link
                                    href={route("estadisticas")}
                                    className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl text-lg md:text-xl font-bold shadow-lg hover:shadow-2xl inline-block"
                                >
                                    Mis Estadísticas
                                </Link>
                            </div>
                        )}

                        {auth.user && hasRole("entrenador") && (
                            <div className="mt-8">
                                <Link
                                    href={route("panel.clases.index")}
                                    className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl text-lg md:text-xl font-bold shadow-lg hover:shadow-2xl inline-block"
                                >
                                    Panel de Control
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
                    <h2 className="text-4xl font-bold text-center mb-12 text-[#14793F]">
                        Explora
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="transform transition hover:scale-105">
                            {auth.user ? (
                                <Link href={route("guias.index")} className="h-full">
                                    <Card
                                        icon="📚"
                                        title="Ejercicios"
                                        containerClassName="bg-white rounded-2xl shadow-lg p-6 h-full hover:shadow-2xl transition"
                                    >
                                        <p className="text-gray-600">Guías preparadas para ejercitar desde casa</p>
                                    </Card>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => {
                                        setAuthMode('login');
                                        setShowAuthModal(true);
                                    }}
                                    className="h-full w-full text-left"
                                >
                                    <Card
                                        icon="📚"
                                        title="Ejercicios"
                                        containerClassName="bg-white rounded-2xl shadow-lg p-6 h-full hover:shadow-2xl transition cursor-pointer"
                                    >
                                        <p className="text-gray-600">Guías preparadas para ejercitar desde casa</p>
                                    </Card>
                                </button>
                            )}
                        </div>

                        <div className="transform transition hover:scale-105">
                            {auth.user ? (
                                <Link href={route("clases.index")} className="h-full">
                                    <Card
                                        icon="🏋️"
                                        title="Clases"
                                        containerClassName="bg-white rounded-2xl shadow-lg p-6 h-full hover:shadow-2xl transition"
                                    >
                                        <p className="text-gray-600">Clases organizadas por nuestros entrenadores para todo tipo de personas</p>
                                    </Card>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => {
                                        setAuthMode('login');
                                        setShowAuthModal(true);
                                    }}
                                    className="h-full w-full text-left"
                                >
                                    <Card
                                        icon="🏋️"
                                        title="Clases"
                                        containerClassName="bg-white rounded-2xl shadow-lg p-6 h-full hover:shadow-2xl transition cursor-pointer"
                                    >
                                        <p className="text-gray-600">Clases organizadas por nuestros entrenadores para todo tipo de personas</p>
                                    </Card>
                                </button>
                            )}
                        </div>

                        <div className="transform transition hover:scale-105">
                            <Link href={route("conocenos")} className="h-full">
                                <Card
                                    icon="✨"
                                    title="Conócenos"
                                    containerClassName="bg-white rounded-2xl shadow-lg p-6 h-full hover:shadow-2xl transition"
                                >
                                    <p className="text-gray-600">
                                        Nuestra historia, misión y el equipo que te acompaña.
                                    </p>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>

            <AuthModal
                show={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                mode={authMode}
                onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            />
        </>
    );
}
