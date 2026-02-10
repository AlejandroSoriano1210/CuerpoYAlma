import React from 'react';

/**
 * ActionButton - Botón de acción con estados de carga
 *
 * @param {function} onClick - Manejador de click
 * @param {boolean} disabled - Si está deshabilitado
 * @param {boolean} loading - Si está en estado de carga
 * @param {string} loadingText - Texto mientras carga
 * @param {ReactNode} children - Contenido del botón
 * @param {string} variant - Variante: "primary" | "secondary" | "danger" | "warning" | "success"
 * @param {string} size - Tamaño: "sm" | "md" | "lg"
 * @param {boolean} fullWidth - Si ocupa todo el ancho
 * @param {string} type - Tipo de botón: "button" | "submit"
 * @param {string} className - Clases adicionales
 */
export default function ActionButton({
    onClick,
    disabled = false,
    loading = false,
    loadingText,
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    type = 'button',
    className = '',
}) {
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
    };

    const sizeClasses = {
        sm: 'py-1.5 px-3 text-sm',
        md: 'py-2 px-4',
        lg: 'py-3 px-6 text-lg',
    };

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${fullWidth ? 'w-full' : ''}
                disabled:bg-gray-400 disabled:cursor-not-allowed
                font-bold rounded transition
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {loading ? (loadingText || 'Cargando...') : children}
        </button>
    );
}
