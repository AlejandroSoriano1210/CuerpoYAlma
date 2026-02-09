import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Zap, Info } from 'lucide-react';

/**
 * ConfirmDialog - Modal de confirmación estilizado
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función al confirmar
 * @param {string} title - Título del diálogo
 * @param {string} message - Mensaje de confirmación
 * @param {string} confirmText - Texto del botón confirmar (default: "Confirmar")
 * @param {string} cancelText - Texto del botón cancelar (default: "Cancelar")
 * @param {string} variant - Variante: "danger" | "warning" | "info" (default: "danger")
 * @param {boolean} processing - Si está procesando
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    processing = false,
}) {
    const variantConfig = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
            buttonClass: 'bg-red-600 hover:bg-red-700',
            iconBg: 'bg-red-100',
        },
        warning: {
            icon: <Zap className="w-6 h-6 text-amber-600" />,
            buttonClass: 'bg-amber-600 hover:bg-amber-700',
            iconBg: 'bg-amber-100',
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            buttonClass: 'bg-blue-600 hover:bg-blue-700',
            iconBg: 'bg-blue-100',
        },
    };

    const config = variantConfig[variant] || variantConfig.danger;

    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center text-2xl`}>
                        {config.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {title}
                        </h3>
                        <p className="text-gray-600">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`px-4 py-2 ${config.buttonClass} disabled:bg-gray-400 text-white font-medium rounded-lg`}
                    >
                        {processing ? 'Procesando...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
