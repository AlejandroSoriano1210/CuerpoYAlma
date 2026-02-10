// Utilidades de validación para formularios

/**
 * Valida un correo electrónico
 * @param {string} email - Email a validar
 * @returns {boolean|string} - true si es válido, string con mensaje de error si no
 */
export const validarEmail = (email) => {
    if (!email) return 'El email es requerido';

    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronEmail.test(email)) {
        return 'El formato del email no es válido';
    }

    return true;
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @param {number} minLength - Longitud mínima (por defecto 8)
 * @returns {boolean|string} - true si es válido, string con mensaje de error si no
 */
export const validarPassword = (password, minLength = 8) => {
    if (!password) return 'La contraseña es requerida';

    if (password.length < minLength) {
        return `La contraseña debe tener al menos ${minLength} caracteres`;
    }

    return true;
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} passwordConfirmation - Confirmación de contraseña
 * @returns {boolean|string} - true si es válido, string con mensaje de error si no
 */
export const validarPasswordConfirmation = (password, passwordConfirmation) => {
    if (!passwordConfirmation) return 'Debes confirmar la contraseña';

    if (password !== passwordConfirmation) {
        return 'Las contraseñas no coinciden';
    }

    return true;
};

/**
 * Valida un teléfono
 * @param {string} telefono - Teléfono a validar
 * @param {boolean} opcional - Si el teléfono es opcional
 * @returns {boolean|string} - true si es válido, string con mensaje de error si no
 */
export const validarTelefono = (telefono, opcional = true) => {
    if (!telefono) return opcional ? true : 'El teléfono es requerido';

    // Patrón para teléfono: solo números, entre 7 y 15 dígitos
    const patronTelefono = /^\d{7,15}$/;
    const telefonoLimpio = telefono.replace(/[\s\-()]/g, '');

    if (!patronTelefono.test(telefonoLimpio)) {
        return 'El teléfono debe contener entre 7 y 15 dígitos';
    }

    return true;
};

/**
 * Valida un campo requerido
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo (para el mensaje de error)
 * @returns {boolean|string} - true si es válido, string con mensaje de error si no
 */
export const validarRequerido = (value, fieldName = 'Este campo') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} es requerido`;
    }

    return true;
};

/**
 * Valida un nombre (solo letras y espacios)
 * @param {string} nombre - Nombre a validar
 * @returns {boolean|string} - true si es válido, string con mensaje de error si no
 */
export const validarNombre = (nombre) => {
    if (!nombre) return 'El nombre es requerido';

    if (nombre.trim().length < 2) {
        return 'El nombre debe tener al menos 2 caracteres';
    }

    const patronNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!patronNombre.test(nombre)) {
        return 'El nombre solo puede contener letras';
    }

    return true;
};

/**
 * Helper para obtener clase de CSS según validación
 * @param {boolean|string} validationResult - Resultado de validación
 * @param {boolean} touched - Si el campo ha sido tocado
 * @returns {string} - Clase CSS para el borde
 */
export const getValidationClass = (validationResult, touched = true) => {
    if (!touched) return 'border-gray-300';
    return validationResult === true ? 'border-gray-300' : 'border-red-500';
};

/**
 * Helper para mostrar mensaje de error
 * @param {boolean|string} validationResult - Resultado de validación
 * @param {boolean} touched - Si el campo ha sido tocado
 * @returns {string|null} - Mensaje de error o null
 */
export const getErrorMessage = (validationResult, touched = true) => {
    if (!touched || validationResult === true) return null;
    return validationResult;
};
