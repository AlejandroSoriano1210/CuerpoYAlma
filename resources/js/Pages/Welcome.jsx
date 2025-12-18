import React from "react";
import Dropdown from "@/Components/Dropdown";
import { Head, Link, usePage } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import { Dumbbell, Users, BookOpen } from "lucide-react";
import { usaRoleUser } from "@/Hooks/usaRoleUser";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";

export default function Welcome({ auth }) {
    const user = usePage().props.auth.user;
    const { hasRole } = usaRoleUser();
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        React.useState(false);

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
                                            Entrenadores
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
                                    <NavLink
                                        href={route("clases.index")}
                                        active={route().current("clases.index")}
                                    >
                                        Clases
                                    </NavLink>
                                </div>
                            </div>

                            <div className="hidden sm:ms-6 sm:flex sm:items-center">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                                >
                                                    {user.name}

                                                    <svg
                                                        className="-me-0.5 ms-2 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route("profile.edit")}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
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
                                href={route('welcome')}
                                active={route().current('welcome')}
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
                            <ResponsiveNavLink
                                href={route("clases.index")}
                                active={route().current("clases.index")}
                            >
                                Clases
                            </ResponsiveNavLink>
                        </div>

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
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route("logout")}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
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
                                <Link
                                    href={route("register")}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-lg md:text-xl font-bold shadow-lg hover:shadow-2xl inline-block"
                                >
                                    Únete Ahora
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
                    <h2 className="text-4xl font-bold text-center mb-12 text-[#14793F]">
                        Explora
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card
                            auth={auth.user}
                            title="Ejercicios"
                            description="Guías preparadas para ejercitar desde casa"
                            icon={<BookOpen size={40} />}
                            route="ejercicios"
                        />

                        <Card
                            auth={auth.user}
                            title="Clases"
                            description="Clases organizadas por nuestros entrenadores para todo tipo de personas"
                            icon={<Dumbbell size={40} />}
                            route="clases"
                        />

                        <Card
                            auth={auth.user}
                            title="Entrenadores"
                            description="Conoce nuestro increíble equipo especializado en distintas partes del cuerpo"
                            icon={<Users size={40} />}
                            route="entrenadores"
                        />
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

function Card({ auth, title, description, icon, route }) {
    const baseClasses =
        "bg-white text-gray-900 rounded-2xl p-6 shadow-lg transform transition";
    const interactiveClasses = auth
        ? "hover:scale-105 hover:shadow-2xl cursor-pointer"
        : "opacity-70 cursor-not-allowed";

    if (auth) {
        return (
            <Link
                href={route}
                className={`${baseClasses} ${interactiveClasses}`}
            >
                <CardContent
                    title={title}
                    description={description}
                    icon={icon}
                />
            </Link>
        );
    }

    return (
        <div className={`${baseClasses} ${interactiveClasses}`}>
            <CardContent title={title} description={description} icon={icon} />
        </div>
    );
}

function CardContent({ title, description, icon }) {
    return (
        <>
            <div className="mb-4 text-green-600">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </>
    );
}
