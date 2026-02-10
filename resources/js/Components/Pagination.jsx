import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * Componente reutilizable para paginación
 *
 * @param {object} data - Objeto de paginación de Laravel con current_page, last_page, prev_page_url, next_page_url
 * @param {string} routeName - Nombre de la ruta para los enlaces
 * @param {object} routeParams - Parámetros adicionales para la ruta
 */
export default function Pagination({ data, routeName, routeParams = {} }) {
    if (!data || data.last_page <= 1) return null;

    return (
        <div className="mt-8 flex justify-center items-center gap-3">
            {data.prev_page_url && (
                <Link
                    href={route(routeName, { ...routeParams, page: data.current_page - 1 })}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition"
                >
                    ← Anterior
                </Link>
            )}
            <div className="text-sm text-gray-600">
                Página {data.current_page} de {data.last_page}
            </div>
            {data.next_page_url && (
                <Link
                    href={route(routeName, { ...routeParams, page: data.current_page + 1 })}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition"
                >
                    Siguiente →
                </Link>
            )}
        </div>
    );
}
