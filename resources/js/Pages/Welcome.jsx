import React from "react";
import { Head, Link } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import { Dumbbell, Users, BookOpen } from "lucide-react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido" />

            <div className="flex flex-col min-h-screen bg-gray-900 text-white">
                <nav className="bg-black/80 backdrop-blur-md shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <h1 className="text-2xl font-bold text-green-400">
                                Cuerpo & Alma
                            </h1>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <>
                                        <span className="text-gray-200">
                                            Hola, {auth.user.name}
                                        </span>
                                        <Link
                                            href={route("dashboard")}
                                            className="bg-green-500 hover:bg-green-600 px-4 py-2 text-white rounded-lg shadow hover:shadow-xl transition"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="px-3 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                        >
                                            Registrarse
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div
                    className="relative h-[70vh] bg-cover bg-center flex items-center justify-center"
                    style={{
                        backgroundImage: "url('/images/hero-gym.jpg')",
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

                    <div className="relative text-center px-6 animate-fadeIn">
                        <h1 className="text-5xl font-extrabold drop-shadow-lg">
                            Cuerpo & Alma Fitness
                        </h1>
                        <p className="mt-4 text-xl text-gray-200">
                            Transforma tu cuerpo. Fortalece tu alma.
                        </p>

                        {!auth.user && (
                            <div className="mt-8">
                                <Link
                                    href={route("register")}
                                    className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-xl text-xl font-bold shadow-lg hover:shadow-2xl"
                                >
                                    Únete Ahora
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 max-w-7xl mx-auto px-6 py-16">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        Explora
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card
                            auth={auth.user}
                            title="Ejercicios"
                            description="Guías preparadas para ejercitar desde casa"
                            icon={<BookOpen size={40} />}
                            route="ejercicios.index"
                        />

                        <Card
                            auth={auth.user}
                            title="Clases"
                            description="Clases organizadas por nuestros entrenadores"
                            icon={<Dumbbell size={40} />}
                            route="clases.index"
                        />

                        <Card
                            auth={auth.user}
                            title="Entrenadores"
                            description="Conoce nuestro increíble equipo especializado en distintas partes del cuerpo"
                            icon={<Users size={40} />}
                            route="entrenadores.index"
                        />
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}

function Card({ auth, title, description, icon, route }) {
    const classes =
        "bg-white text-gray-900 rounded-2xl p-6 shadow-lg transform transition hover:scale-105 hover:shadow-2xl";

    if (auth) {
        return (
            <Link href={route} className={classes}>
                <CardContent
                    title={title}
                    description={description}
                    icon={icon}
                />
            </Link>
        );
    }

    return (
        <div className={`${classes} opacity-70 cursor-not-allowed`}>
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
