import React from 'react';
import EmptyState from './EmptyState';

/**
 * DetailSection - Sección de detalle con título, icono y contenido
 *
 * @param {string} title - Título de la sección
 * @param {number} count - Contador opcional para mostrar junto al título
 * @param {ReactNode} icon - Icono del título
 * @param {string} emptyMessage - Mensaje cuando está vacío
 * @param {ReactNode} emptyIcon - Icono del estado vacío
 * @param {ReactNode} children - Contenido de la sección
 * @param {boolean} isEmpty - Si la sección está vacía
 * @param {string} className - Clases adicionales
 */
export default function DetailSection({
    title,
    count,
    icon,
    emptyMessage = 'No hay elementos',
    emptyIcon,
    children,
    isEmpty = false,
    className = '',
}) {
    return (
        <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                {icon && <span className="text-gray-600">{icon}</span>}
                {title}
                {count !== undefined && (
                    <span className="text-gray-500 font-normal">({count})</span>
                )}
            </h2>

            {isEmpty ? (
                <EmptyState
                    icon={emptyIcon}
                    message={emptyMessage}
                />
            ) : (
                children
            )}
        </div>
    );
}
