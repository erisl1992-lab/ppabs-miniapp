// storage.js - Manejo de almacenamiento local
export const Storage = {
    /**
     * Guarda datos en localStorage
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage set error:', e);
        }
    },

    /**
     * Recupera datos de localStorage
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage get error:', e);
            return defaultValue;
        }
    },

    /**
     * Elimina una clave
     */
    remove: (key) => {
        localStorage.removeItem(key);
    },

    /**
     * Limpia todo
     */
    clear: () => {
        localStorage.clear();
    }
};