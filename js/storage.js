// storage.js - Manejo de almacenamiento local
export const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage set error:', e);
        }
    },

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Storage get error:', e);
            return defaultValue;
        }
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    },

    // NUEVO: Obtener usuario guardado
    getUser: () => {
        return Storage.get('user');
    },

    // NUEVO: Guardar usuario
    setUser: (user) => {
        Storage.set('user', user);
    }
};