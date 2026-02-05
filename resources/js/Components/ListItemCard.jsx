import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * ListItemCard - Tarjeta horizontal para listas
 *
 * @param {string} imageUrl - URL de la imagen
 * @param {string} imageAlt - Alt de la imagen
 * @param {string} title - Título
 * @param {string} titleHref - Link del título
 * @param {string} subtitle - Subtítulo
 * @param {ReactNode} badges - Badges
 * @param {string} description - Descripción
 * @param {ReactNode} actions - Acciones
 * @param {ReactNode} children - Contenido adicional
 * @param {string} orientation - Orientación: "horizontal" | "vertical"
 */
export default function ListItemCard({
    imageUrl,
    imageAlt,
    title,
    titleHref,
    subtitle,
    badges,
    description,
    actions,
    children,
    orientation = 'horizontal',
}) {
    const isHorizontal = orientation === 'horizontal';

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6">
            <div className={`flex ${isHorizontal ? 'flex-col lg:flex-row' : 'flex-col'} justify-between items-start gap-4`}>
                <div className={`flex ${isHorizontal ? 'flex-col sm:flex-row' : 'flex-col'} gap-4 flex-1`}>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={imageAlt || title}
                            className={`rounded-lg object-cover ${isHorizontal ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-full h-40'}`}
                        />
                    )}

                    <div className="flex-1">
                        {titleHref ? (
                            <Link
                                href={titleHref}
                                className="text-xl font-bold text-gray-900 hover:text-green-600 transition"
                            >
                                {title}
                            </Link>
                        ) : (
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        )}

                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                        )}

                        {badges && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {badges}
                            </div>
                        )}

                        {description && (
                            <p className="text-gray-600 mt-2 line-clamp-2">{description}</p>
                        )}

                        {children}
                    </div>
                </div>

                {actions && (
                    <div className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-2`}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
