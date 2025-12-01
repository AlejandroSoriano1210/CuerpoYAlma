import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Bienvenido" />
            <div className="min-h-screen bg-green-800">
                <nav className="bg-white shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold text-blue-600">
                                    Cuerpo & Alma
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <>
                                        <span className="text-gray-700">
                                            {auth.user.name}
                                        </span>
                                        <Link
                                            href={route("dashboard")}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="bg-green-500 hover:bg-green-600 text-gray-700 hover:text-gray-900 font-bold px-3 py-2 rounded"
                                        >
                                            Iniciar Sesión
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Registrarse
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h2 className="text-5xl font-bold text-white mb-6">
                            ¡Bienvenido!
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                        {auth.user ? (
                            <Link
                                href={route("entrenadores.index")}
                                className="bg-white rounded-lg p-6 shadow-lg"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Entrenadores
                                </h3>
                                <p className="text-gray-600">
                                    Gestiona tu equipo de entrenadores y sus
                                    horarios de trabajo
                                </p>
                            </Link>
                        ) : (
                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Entrenadores
                                </h3>
                                <p className="text-gray-600">
                                    Gestiona tu equipo de entrenadores y sus
                                    horarios de trabajo
                                </p>
                            </div>
                        )}

                        {auth.user ? (
                            <Link
                                href={route("clases.index")}
                                className="bg-white rounded-lg p-6 shadow-lg"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Clases
                                </h3>
                                <p className="text-gray-600">
                                    Crea y administra tus clases con horarios y
                                    capacidad
                                </p>
                            </Link>
                        ) : (
                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Clases
                                </h3>
                                <p className="text-gray-600">
                                    Crea y administra tus clases con horarios y
                                    capacidad
                                </p>
                            </div>
                        )}

                        {auth.user ? (
                            <Link
                                href={route("clases.index")}
                                className="bg-white rounded-lg p-6 shadow-lg"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Ejercicios
                            </h3>
                            <p className="text-gray-600">
                                Biblioteca completa de ejercicios y
                                entrenamientos
                            </p>
                            </Link>
                        ) : (
                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Ejercicios
                            </h3>
                            <p className="text-gray-600">
                                Biblioteca completa de ejercicios y
                                entrenamientos
                            </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
