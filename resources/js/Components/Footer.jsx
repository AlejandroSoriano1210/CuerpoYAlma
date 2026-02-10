import { Link, usePage } from "@inertiajs/react";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Clock } from "lucide-react";

export default function Footer() {
    const { gimnasioHorarios } = usePage().props;

    // Mapear orden de días
    const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const horariosOrdenados = gimnasioHorarios
        ? [...gimnasioHorarios].sort((a, b) => {
            return diasOrden.indexOf(a.dia_semana) - diasOrden.indexOf(b.dia_semana);
        })
        : [];

    // Agrupar días con el mismo horario
    const horariosAgrupados = horariosOrdenados.reduce((acc, horario) => {
        const horarioStr = `${horario.hora_apertura.substring(0, 5)} - ${horario.hora_cierre.substring(0, 5)}`;

        if (!acc.find(grupo => grupo.horario === horarioStr)) {
            acc.push({ dias: [horario.dia_semana], horario: horarioStr });
        } else {
            const grupo = acc.find(grupo => grupo.horario === horarioStr);
            grupo.dias.push(horario.dia_semana);
        }

        return acc;
    }, []);

    // Formatear rango de días
    const formatearDias = (dias) => {
        if (dias.length === 1) return dias[0];

        const contiguos = [];
        let actual = [dias[0]];

        for (let i = 1; i < dias.length; i++) {
            const indiceAnterior = diasOrden.indexOf(dias[i - 1]);
            const indiceActual = diasOrden.indexOf(dias[i]);

            if (indiceActual === indiceAnterior + 1) {
                actual.push(dias[i]);
            } else {
                contiguos.push(actual);
                actual = [dias[i]];
            }
        }
        contiguos.push(actual);

        return contiguos.map(grupo =>
            grupo.length === 1 ? grupo[0] : `${grupo[0]} a ${grupo[grupo.length - 1]}`
        ).join(', ');
    };

    return (
        <footer className="mt-16 bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-green-400 mb-4">
                            Cuerpo & Alma
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Tu gimnasio para entrenar con propósito, acompañamiento y resultados reales.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href={route("conocenos")}
                                    className="text-gray-300 hover:text-green-400 transition"
                                >
                                    Conócenos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("welcome")}
                                    className="text-gray-300 hover:text-green-400 transition"
                                >
                                    Inicio
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-300 hover:text-green-400 transition"
                                >
                                    Términos de uso
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-300 hover:text-green-400 transition"
                                >
                                    Privacidad
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2 text-gray-300">
                                <MapPin size={16} className="text-green-400" />
                                Calle Principal 123
                            </li>
                            <li className="flex items-center gap-2 text-gray-300">
                                <Phone size={16} className="text-green-400" />
                                +34 123 456 789
                            </li>
                            <li className="flex items-center gap-2 text-gray-300">
                                <Mail size={16} className="text-green-400" />
                                info@cuerpoalma.com
                            </li>
                        </ul>
                    </div>

                    {/* Horarios */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                            <Clock size={18} className="text-green-400" />
                            Horarios
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            {horariosAgrupados.length > 0 ? (
                                horariosAgrupados.map((grupo, idx) => (
                                    <li key={idx} className="bg-gray-800 rounded-lg px-3 py-2 border border-green-400/20">
                                        <div className="font-medium text-green-400">{formatearDias(grupo.dias)}</div>
                                        <div className="text-gray-300 mt-1">{grupo.horario}</div>
                                    </li>
                                ))
                            ) : (
                                <li>No hay horarios configurados</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 pt-8"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Cuerpo & Alma. Todos los derechos reservados.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            className="text-gray-400 hover:text-green-400 transition"
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a
                            href="#"
                            className="text-gray-400 hover:text-green-400 transition"
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                        <a
                            href="#"
                            className="text-gray-400 hover:text-green-400 transition"
                            aria-label="Twitter"
                        >
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
