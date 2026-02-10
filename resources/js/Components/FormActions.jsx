import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * FormActions - Botones de acción para formularios (Guardar/Cancelar)
 *
 * @param {boolean} processing - Si el formulario está procesándose
 * @param {string} cancelHref - URL para el botón cancelar
 * @param {string} submitText - Texto del botón submit (default: "Guardar")
 * @param {string} processingText - Texto mientras procesa (default: "Guardando...")
 * @param {string} cancelText - Texto del botón cancelar (default: "Cancelar")
 * @param {boolean} disabled - Deshabilitar el botón submit
 * @param {string} variant - Variante del botón: "primary" | "danger" (default: "primary")
 */
export default function FormActions({
    processing = false,
    cancelHref,
    submitText = 'Guardar',
    processingText = 'Guardando...',
    cancelText = 'Cancelar',
    disabled = false,
    variant = 'primary',
}) {
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700',
        danger: 'bg-red-600 hover:bg-red-700',
    };

    return (
        <div className="flex gap-4">
            <button
                type="submit"
                disabled={processing || disabled}
                className={`flex-1 ${variantClasses[variant]} disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded`}
            >
                {processing ? processingText : submitText}
            </button>
            <Link
                href={cancelHref}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-center"
            >
                {cancelText}
            </Link>
        </div>
    );
}
