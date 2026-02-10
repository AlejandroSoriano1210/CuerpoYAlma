import React from 'react';

/**
 * Componente reutilizable para tarjetas de estadísticas
 *
 * @param {string} title - Título/etiqueta de la estadística
 * @param {string|number} value - Valor de la estadística
 * @param {React.ReactNode} icon - Icono de lucide-react
 * @param {string} iconBgColor - Color de fondo del icono (ej: "bg-blue-100")
 * @param {string} iconColor - Color del icono (ej: "text-blue-600")
 * @param {string} description - Descripción adicional
 * @param {string} trend - Tendencia (up, down, neutral)
 * @param {string} trendValue - Valor de la tendencia (ej: "+5%")
 */
export default function StatCard({
    title,
    value,
    icon,
    iconBgColor = 'bg-gray-100',
    iconColor = 'text-gray-600',
    description,
    trend,
    trendValue,
}) {
    const IconComponent = icon;

    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-500',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className={`${iconBgColor} p-3 rounded-lg`}>
                        {React.isValidElement(icon) ? (
                            <span className={iconColor}>{icon}</span>
                        ) : (
                            <IconComponent className={iconColor} size={24} />
                        )}
                    </div>
                )}
                <div className="flex-1">
                    <p className="text-sm text-gray-500">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                        {trend && trendValue && (
                            <span className={`text-sm ${trendColors[trend]}`}>
                                {trendIcons[trend]} {trendValue}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-gray-400 mt-1">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
