/**
 * Utilidades para formateo de fechas
 */

const LOCALE = 'es-ES';

/**
 * Formatea una fecha según el formato especificado
 *
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato: "short" | "long" | "full" | "datetime" | "time"
 * @returns {string} Fecha formateada
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const formats = {
        short: {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        },
        long: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        },
        full: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
        datetime: {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
        time: {
            hour: '2-digit',
            minute: '2-digit',
        },
        monthYear: {
            month: 'long',
            year: 'numeric',
        },
    };

    return dateObj.toLocaleDateString(LOCALE, formats[format] || formats.short);
}

/**
 * Obtiene la fecha relativa (hace X tiempo)
 *
 * @param {string|Date} date - Fecha
 * @returns {string} Fecha relativa
 */
export function formatRelativeDate(date) {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'hace un momento';
    if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

    return formatDate(dateObj, 'short');
}

/**
 * Hook para usar formateo de fechas en componentes
 */
export function useFormatDate() {
    return {
        formatDate,
        formatRelativeDate,
        formatShort: (date) => formatDate(date, 'short'),
        formatLong: (date) => formatDate(date, 'long'),
        formatFull: (date) => formatDate(date, 'full'),
        formatDatetime: (date) => formatDate(date, 'datetime'),
        formatTime: (date) => formatDate(date, 'time'),
    };
}

export default formatDate;
