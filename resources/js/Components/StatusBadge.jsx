import React from 'react';

/**
 * Componente reutilizable para badges de estado
 *
 * @param {string} status - Estado a mostrar
 * @param {string} variant - Variante de color (success, warning, danger, info, neutral)
 * @param {string} size - Tamaño (sm, md, lg)
 * @param {object} customColors - Mapeo personalizado de estados a colores {estado: {bg, text}}
 */

const defaultColors = {
    success: { bg: 'bg-green-100', text: 'text-green-800' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    danger: { bg: 'bg-red-100', text: 'text-red-800' },
    info: { bg: 'bg-blue-100', text: 'text-blue-800' },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-800' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
};

// Mapeo común de estados a variantes
const statusVariantMap = {
    // Máquinas
    operativa: 'success',
    mantenimiento: 'warning',
    fuera_de_servicio: 'danger',
    // Empleados
    disponible: 'success',
    baja: 'danger',
    vacaciones: 'info',
    // Pagos
    pagado: 'success',
    pendiente: 'warning',
    // Guías
    principiante: 'success',
    intermedio: 'warning',
    avanzado: 'danger',
};

export default function StatusBadge({
    status,
    variant,
    size = 'sm',
    customColors,
    label,
}) {
    // Determinar la variante a usar
    const resolvedVariant = variant || statusVariantMap[status] || 'neutral';

    // Obtener colores
    const colors = customColors?.[status] || defaultColors[resolvedVariant] || defaultColors.neutral;

    // Formatear el texto del estado
    const displayText = label || status?.toString().replaceAll('_', ' ');

    return (
        <span
            className={`
                inline-block rounded-full font-medium capitalize
                ${colors.bg} ${colors.text}
                ${sizeClasses[size]}
            `}
        >
            {displayText}
        </span>
    );
}
