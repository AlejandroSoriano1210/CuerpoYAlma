import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import NavLink from "@/Components/NavLink";
import NotificationsBell from "@/Components/NotificationsBell";
import AuthModal from "@/Components/AuthModal";
import { usaRoleUser } from "@/Hooks/usaRoleUser";
import { Award, Heart, Dumbbell, Users, MapPin, Clock } from "lucide-react";

export default function Conocenos() {
    const user = usePage().props.auth?.user;
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        React.useState(false);
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [authMode, setAuthMode] = React.useState("login");

    return (
        <>
            <Head title="Conócenos" />

            <div className="bg-gray-900 min-h-screen flex flex-col">
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
                                    {hasAnyRole(["entrenador", "jefe_entrenadores"]) && (
                                        <NavLink
                                            href={route("panel.clases.index")}
                                            active={route().current(
                                                "panel.clases.index"
                                            )}
                                        >
                                            Panel de control
                                        </NavLink>
                                    )}
                                    {user ? (
                                        <NavLink
                                            href={route("clases.index")}
                                            active={route().current(
                                                "clases.index"
                                            )}
                                        >
                                            Clases
                                        </NavLink>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAuthMode("login");
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
                                            active={route().current(
                                                "guias.index"
                                            )}
                                        >
                                            Guías
                                        </NavLink>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAuthMode("login");
                                                setShowAuthModal(true);
                                            }}
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-gray-300 transition duration-150 ease-in-out hover:border-green-400 hover:text-green-400 focus:border-green-400 focus:text-green-400 focus:outline-none"
                                        >
                                            Guías
                                        </button>
                                    )}
                                    {hasAnyRole(["entrenador", "jefe_entrenadores", "superusuario"]) && (
                                        <NavLink
                                            href={route("ejercicios.index")}
                                            active={route().current(
                                                "ejercicios.index"
                                            )}
                                        >
                                            Ejercicios
                                        </NavLink>
                                    )}
                                    {user ? (
                                        <NavLink
                                            href={route("maquinas.index")}
                                            active={route().current(
                                                "maquinas.index"
                                            )}
                                        >
                                            Máquinas
                                        </NavLink>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAuthMode("login");
                                                setShowAuthModal(true);
                                            }}
                                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium leading-5 text-gray-300 transition duration-150 ease-in-out hover:border-green-400 hover:text-green-400 focus:border-green-400 focus:text-green-400 focus:outline-none"
                                        >
                                            Máquinas
                                        </button>
                                    )}
                                    <NavLink
                                        href={route("conocenos")}
                                        active={route().current("conocenos")}
                                    >
                                        Conócenos
                                    </NavLink>
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
                                                setAuthMode("login");
                                                setShowAuthModal(true);
                                            }}
                                            className="px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition font-medium"
                                        >
                                            Iniciar sesión
                                        </button>

                                        <button
                                            onClick={() => {
                                                setAuthMode("register");
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

                <section
                    className="relative h-[60vh] bg-cover bg-center flex items-center justify-center"
                    style={{
                        backgroundImage: "url('/images/hero-gym.jpg')",
                        backgroundAttachment: "fixed",
                    }}
                >
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative text-center px-6 max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white">
                            Conócenos
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-gray-200">
                            Somos un gimnasio diseñado para que entrenes con propósito,
                            acompañamiento y resultados reales.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            {user ? (
                                <Link
                                    href={route("clases.index")}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
                                >
                                    Ver clases
                                </Link>
                            ) : (
                                <button
                                    onClick={() => {
                                        setAuthMode("register");
                                        setShowAuthModal(true);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
                                >
                                    Únete hoy
                                </button>
                            )}
                            <Link
                                href={route("welcome")}
                                className="px-6 py-3 rounded-xl text-lg font-semibold text-white/90 border border-white/30 hover:border-white/60"
                            >
                                Volver al inicio
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="bg-white">
                    <div className="max-w-7xl mx-auto px-6 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900">
                                    Nuestra misión
                                </h2>
                                <p className="mt-4 text-gray-600 leading-relaxed">
                                    En Cuerpo & Alma creemos que el bienestar es un equilibrio entre
                                    fuerza física y salud mental. Por eso ofrecemos programas
                                    personalizados, instalaciones cuidadas y un equipo humano que te
                                    acompaña en cada paso.
                                </p>
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                                        <Dumbbell className="text-green-600" />
                                        <span className="text-gray-700 font-medium">
                                            Entrenamiento inteligente
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4">
                                        <Heart className="text-green-600" />
                                        <span className="text-gray-700 font-medium">
                                            Bienestar integral
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded-3xl p-8 shadow-inner">
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    Lo que nos diferencia
                                </h3>
                                <ul className="mt-4 space-y-4 text-gray-600">
                                    <li className="flex gap-3">
                                        <Award className="text-green-600" />
                                        Entrenadores certificados y cercanos.
                                    </li>
                                    <li className="flex gap-3">
                                        <Users className="text-green-600" />
                                        Comunidad activa que te motiva a seguir.
                                    </li>
                                    <li className="flex gap-3">
                                        <Clock className="text-green-600" />
                                        Horarios flexibles y reservas online.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6 py-16">
                        <h2 className="text-3xl font-bold text-gray-900 text-center">
                            Espacios y servicios
                        </h2>
                        <p className="mt-4 text-gray-600 text-center max-w-3xl mx-auto">
                            Diseñamos cada zona para que tengas la mejor experiencia: desde fuerza
                            y cardio hasta salas de clases dirigidas.
                        </p>

                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Zona de fuerza",
                                    text: "Máquinas modernas, pesos libres y asesoramiento continuo.",
                                },
                                {
                                    title: "Clases guiadas",
                                    text: "HIIT, funcional, movilidad y más. Planes para todos los niveles.",
                                },
                                {
                                    title: "Bienestar",
                                    text: "Espacios para estiramiento, recuperación y movilidad.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="bg-white rounded-2xl shadow-lg p-6"
                                >
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white">
                    <div className="max-w-7xl mx-auto px-6 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div className="rounded-3xl border border-gray-200 p-8">
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    ¿Dónde estamos?
                                </h3>
                                <p className="mt-4 text-gray-600">
                                    Estamos en una ubicación céntrica, fácil de llegar y con un
                                    ambiente seguro y cómodo.
                                </p>
                                <div className="mt-6 space-y-3 text-gray-700">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-green-600" />
                                        Calle Principal 123, Ciudad
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-green-600" />
                                        Lunes a Domingo · 07:00 - 22:00
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl">
                                <h3 className="text-2xl font-semibold">
                                    Nuestro equipo
                                </h3>
                                <p className="mt-4 text-gray-200">
                                    Entrenadores especializados en fuerza, movilidad y rendimiento. Te
                                    ayudamos a alcanzar tu mejor versión con planes adaptados.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {["Nutrición", "Fuerza", "Funcional", "Movilidad"].map(
                                        (tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full bg-white/10 px-4 py-2 text-sm"
                                            >
                                                {tag}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                        <h2 className="text-3xl font-bold">
                            ¿Listo para entrenar con nosotros?
                        </h2>
                        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
                            Empieza hoy y disfruta de un plan que se adapta a tu ritmo y objetivos.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            {user ? (
                                <Link
                                    href={route("guias.index")}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
                                >
                                    Ver guías
                                </Link>
                            ) : (
                                <button
                                    onClick={() => {
                                        setAuthMode("register");
                                        setShowAuthModal(true);
                                    }}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-lg font-bold shadow-lg"
                                >
                                    Crear cuenta
                                </button>
                            )}
                            <Link
                                href={route("welcome")}
                                className="px-6 py-3 rounded-xl text-lg font-semibold text-white/90 border border-white/30 hover:border-white/60"
                            >
                                Explorar el sitio
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>

            <AuthModal
                show={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                mode={authMode}
                onSwitchMode={() =>
                    setAuthMode(authMode === "login" ? "register" : "login")
                }
            />
        </>
    );
}
