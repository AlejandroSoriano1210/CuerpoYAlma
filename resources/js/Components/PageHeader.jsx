import React from 'react';

/**
 * Componente reutilizable para headers de página
 *
 * @param {string} title - Título de la página
 * @param {string} description - Descripción opcional
 * @param {React.ReactNode} icon - Icono de lucide-react
 * @param {React.ReactNode} actions - Botones de acción (ej: "Nuevo", "Exportar")
 * @param {string} iconColor - Color del icono (default: "text-green-600")
 */
export default function PageHeader({
    title,
    description,
    icon,
    actions,
    iconColor = "text-green-600"
}) {
    const IconComponent = icon;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                        {icon && (
                            <span className={iconColor}>
                                {React.isValidElement(icon) ? icon : <IconComponent size={36} />}
                            </span>
                        )}
                        {title}
                    </h1>
                    {description && (
                        <p className="text-gray-300">{description}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
