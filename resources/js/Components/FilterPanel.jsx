import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

/**
 * Componente reutilizable para panel de filtros lateral
 *
 * @param {string} title - Título del panel (default: "Filtros")
 * @param {React.ReactNode} children - Contenido del panel (inputs de filtros)
 * @param {function} onClear - Función para limpiar filtros
 * @param {boolean} showClear - Mostrar botón de limpiar
 * @param {boolean} sticky - Si el panel debe ser sticky (default: true)
 * @param {string} className - Clases CSS adicionales
 */
export default function FilterPanel({
    title = 'Filtros',
    children,
    onClear,
    showClear = true,
    sticky = true,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <aside className={`lg:col-span-3 ${className}`}>
            <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${sticky ? 'lg:sticky lg:top-6' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <RotateCcw size={20} className="text-gray-600" />
                        {title}
                    </h2>
                    <div className="flex items-center gap-3">
                        {showClear && onClear && (
                            <button
                                onClick={onClear}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Limpiar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            {isOpen ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>
                </div>
                <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
                    <div className="grid grid-cols-1 gap-4">
                        {children}
                    </div>
                </div>
            </div>
        </aside>
    );
}
