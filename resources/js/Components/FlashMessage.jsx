import React from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Componente reutilizable para mensajes flash
 * Puede usarse de forma automática (lee de usePage) o manual (props)
 *
 * @param {string} success - Mensaje de éxito a mostrar
 * @param {string} error - Mensaje de error a mostrar
 * @param {boolean} autoDetect - Si true, detecta automáticamente flash de usePage (default: true)
 */
export default function FlashMessage({ success, error, autoDetect = true }) {
    const { flash } = usePage().props;

    const successMessage = success || (autoDetect ? flash?.success : null);
    const errorMessage = error || (autoDetect ? flash?.error : null);

    if (!successMessage && !errorMessage) return null;

    return (
        <>
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <span className="text-lg">✓</span>
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <span className="text-lg">✕</span>
                    {errorMessage}
                </div>
            )}
        </>
    );
}
