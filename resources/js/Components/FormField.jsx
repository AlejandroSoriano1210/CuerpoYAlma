import React from 'react';

/**
 * Componente reutilizable para campos de formulario
 *
 * @param {string} label - Etiqueta del campo
 * @param {string} name - Nombre del campo
 * @param {string} type - Tipo de input (text, email, password, number, select, textarea)
 * @param {string} value - Valor actual
 * @param {function} onChange - Función onChange
 * @param {string} error - Mensaje de error
 * @param {string} placeholder - Placeholder del input
 * @param {boolean} required - Si el campo es requerido
 * @param {boolean} disabled - Si el campo está deshabilitado
 * @param {array} options - Opciones para select (array de {value, label})
 * @param {number} rows - Filas para textarea (default: 4)
 * @param {string} className - Clases CSS adicionales
 */
export default function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    options = [],
    rows = 4,
    className = '',
    ...props
}) {
    const baseClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
        error ? 'border-red-500' : 'border-gray-300'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    const renderInput = () => {
        if (type === 'select') {
            return (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={baseClasses}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={rows}
                    className={baseClasses}
                    {...props}
                />
            );
        }

        return (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={baseClasses}
                {...props}
            />
        );
    };

    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {renderInput()}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
