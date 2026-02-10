import React from 'react';

/**
 * InfoGrid - Cuadrícula de información con etiquetas y valores
 *
 * @param {Array} items - Array de items: { label, value, icon?, bgColor? }
 * @param {number} columns - Número de columnas: 1 | 2 | 3 | 4
 * @param {string} variant - Variante: "simple" | "card"
 * @param {string} gap - Espaciado: "sm" | "md" | "lg"
 */
export default function InfoGrid({
    items = [],
    columns = 2,
    variant = 'simple',
    gap = 'md',
}) {
    const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    const gapClasses = {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
    };

    if (variant === 'card') {
        return (
            <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`p-6 rounded-lg ${item.bgColor || 'bg-gray-50'}`}
                    >
                        <h3 className="text-sm font-medium text-gray-600 mb-2">
                            {item.icon && <span className="mr-1">{item.icon}</span>}
                            {item.label}
                        </h3>
                        <p className={`text-2xl font-bold ${item.valueColor || 'text-gray-900'}`}>
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
            {items.map((item, index) => (
                <div key={index}>
                    <label className="block text-sm font-medium text-gray-600">
                        {item.icon && <span className="mr-1">{item.icon}</span>}
                        {item.label}
                    </label>
                    <p className={`text-lg font-medium ${item.valueColor || 'text-gray-900'}`}>
                        {item.value || '-'}
                    </p>
                </div>
            ))}
        </div>
    );
}
