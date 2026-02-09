import React from "react";
import { Head, Link } from "@inertiajs/react";
import Footer from "@/Components/Footer";
import Card from "@/Components/Card";
import { Dumbbell, Users, BookOpen, Star } from "lucide-react";
import { usaRoleUser } from "@/Hooks/usaRoleUser";
import AuthModal from "@/Components/AuthModal";
import MainNav from "@/Components/MainNav";

export default function Welcome({ auth }) {
    const { hasRole, hasAnyRole } = usaRoleUser();
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [authMode, setAuthMode] = React.useState('login');

    return (
        <>
            <Head title="Bienvenido" />

            <div className="bg-gray-900">
                <MainNav
                    onAuthModal={(mode) => {
                        setAuthMode(mode);
                        setShowAuthModal(true);
                    }}
                />
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

                        {auth.user && hasAnyRole(["entrenador", "jefe_entrenadores"]) && (
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
                                        icon={<BookOpen className="text-green-600" size={40} />}
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
                                        icon={<BookOpen className="text-green-600" size={40} />}
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
                                        icon={<Dumbbell className="text-green-600" size={40} />}
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
                                        icon={<Dumbbell className="text-green-600" size={40} />}
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
                                    icon={<Star className="text-green-600" size={40} />}
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
