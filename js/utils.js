// utils.js - Utilidades generales
export const Utils = {
    /**
     * Formatea una fecha en string local
     */
    formatDate: (isoString) => {
        if (!isoString) return '--';
        return new Date(isoString).toLocaleString('es-VE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Formatea un número como moneda
     */
    formatCurrency: (amount, currency = 'USD') => {
        const num = parseFloat(amount) || 0;
        if (currency === 'USD') return `$${num.toFixed(2)}`;
        return `${num.toFixed(2)} Bs`;
    },

    /**
     * Genera un ID único corto
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    },

    /**
     * Trunca un texto
     */
    truncate: (text, maxLength = 40) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },

    /**
     * Obtiene el emoji de un estado
     */
    getStatusEmoji: (status) => {
        const map = {
            VALIDANDO: '🟠',
            EN_PROCESO: '🟢',
            PROCESO_MANUAL: '🟡',
            COMPLETADO: '✅',
            CANCELADO: '🔴'
        };
        return map[status] || '❓';
    },

    /**
     * Obtiene la clase CSS para un estado
     */
    getStatusClass: (status) => {
        const map = {
            VALIDANDO: 'status-validando',
            EN_PROCESO: 'status-enproceso',
            PROCESO_MANUAL: 'status-procesomanual',
            COMPLETADO: 'status-completado',
            CANCELADO: 'status-cancelado'
        };
        return map[status] || '';
    },

    /**
     * Debounce para input
     */
    debounce: (fn, delay = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }
};