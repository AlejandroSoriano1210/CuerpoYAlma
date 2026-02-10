import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Componente reutilizable para enlace de volver atrás
 *
 * @param {string} href - URL de destino
 * @param {string} text - Texto del enlace
 * @param {string} className - Clases CSS adicionales
 */
export default function BackLink({
    href,
    text = 'Volver',
    className = ''
}) {
    return (
        <Link
            href={href}
            className={`text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1 transition ${className}`}
        >
            <span>←</span> {text}
        </Link>
    );
}
