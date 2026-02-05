import React from 'react';

/**
 * Componente reutilizable para estados vacíos
 *
 * @param {React.ReactNode} icon - Icono de lucide-react
 * @param {string} message - Mensaje a mostrar
 * @param {string} description - Descripción adicional opcional
 * @param {React.ReactNode} action - Botón o acción opcional
 */
export default function EmptyState({
    icon,
    message,
    description,
    action
}) {
    const IconComponent = icon;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            {icon && (
                <div className="mx-auto text-gray-300 mb-4">
                    {React.isValidElement(icon) ? icon : <IconComponent size={48} />}
                </div>
            )}
            <p className="text-gray-500 text-lg">{message}</p>
            {description && (
                <p className="text-gray-400 text-sm mt-2">{description}</p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
