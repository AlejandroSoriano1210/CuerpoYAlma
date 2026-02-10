import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * ResourceCard - Tarjeta para mostrar recursos en grids
 *
 * @param {string} imageUrl - URL de la imagen
 * @param {string} imageAlt - Alt de la imagen
 * @param {string} title - Título del recurso
 * @param {string} titleHref - Link del título
 * @param {ReactNode} badges - Badges a mostrar
 * @param {string} description - Descripción del recurso
 * @param {number} descriptionLines - Líneas máximas de descripción
 * @param {ReactNode} actions - Botones de acción
 * @param {ReactNode} children - Contenido adicional
 * @param {ReactNode} meta - Metadatos adicionales (fecha, autor, etc.)
 */
export default function ResourceCard({
    imageUrl,
    imageAlt,
    title,
    titleHref,
    badges,
    description,
    descriptionLines = 3,
    actions,
    children,
    meta,
}) {
    const lineClampClasses = {
        1: 'line-clamp-1',
        2: 'line-clamp-2',
        3: 'line-clamp-3',
        4: 'line-clamp-4',
        5: 'line-clamp-5',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex flex-col">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={imageAlt || title}
                    className="mb-4 h-40 w-full rounded-lg object-cover"
                />
            )}

            <div className="mb-2">
                {titleHref ? (
                    <Link href={titleHref}>
                        <h3 className="font-bold text-lg text-gray-900 hover:text-green-600 transition">
                            {title}
                        </h3>
                    </Link>
                ) : (
                    <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                )}

                {badges && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {badges}
                    </div>
                )}
            </div>

            {meta && (
                <div className="text-sm text-gray-500 mb-2">
                    {meta}
                </div>
            )}

            {description && (
                <p className={`text-gray-600 text-sm mb-4 flex-1 ${lineClampClasses[descriptionLines]}`}>
                    {description}
                </p>
            )}

            {children}

            {actions && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
