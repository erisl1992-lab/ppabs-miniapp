// telegram.js - Interacción con Telegram Web App
export const Telegram = {
    _instance: null,

    /**
     * Inicializa la integración con Telegram
     */
    init: () => {
        if (window.Telegram?.WebApp) {
            Telegram._instance = window.Telegram.WebApp;
            Telegram._instance.ready();
            Telegram._instance.expand();
            return Telegram._instance;
        }
        console.warn('Telegram WebApp no disponible, modo demo');
        return null;
    },

    /**
     * Obtiene el usuario de Telegram
     */
    getUser: () => {
        const tg = Telegram._instance;
        if (tg?.initDataUnsafe?.user) {
            return tg.initDataUnsafe.user;
        }
        // Fallback para pruebas
        const params = new URLSearchParams(window.location.search);
        const id = params.get('user') || '123456789';
        const name = params.get('name') || 'Usuario Demo';
        return {
            id: parseInt(id),
            first_name: name,
            username: 'demo_user'
        };
    },

    /**
     * Obtiene el ID del usuario (como string)
     */
    getUserId: () => {
        const user = Telegram.getUser();
        return user?.id?.toString() || null;
    },

    /**
     * Envía datos a Telegram
     */
    sendData: (data) => {
        const tg = Telegram._instance;
        if (tg) {
            tg.sendData(JSON.stringify(data));
        } else {
            console.log('[Telegram] Data:', data);
        }
    },

    /**
     * Cierra la WebApp
     */
    close: () => {
        const tg = Telegram._instance;
        if (tg) {
            tg.close();
        } else {
            window.close();
        }
    },

    /**
     * Muestra un popup nativo de Telegram
     */
    showPopup: (params) => {
        const tg = Telegram._instance;
        if (tg?.showPopup) {
            return new Promise((resolve) => {
                tg.showPopup(params, (buttonId) => resolve(buttonId));
            });
        }
        // Fallback
        alert(params.message || 'Popup');
        return Promise.resolve('ok');
    },

    /**
     * Muestra una alerta nativa
     */
    showAlert: (message) => {
        const tg = Telegram._instance;
        if (tg?.showAlert) {
            tg.showAlert(message);
        } else {
            alert(message);
        }
    }
};

export const tg = Telegram;