// notifications.js - Gestión de notificaciones internas
import { Toast } from './components/toast.js';

export const Notifications = {
    /**
     * Muestra una notificación toast
     */
    show: (message, type = 'info', duration = 3000) => {
        Toast.show(message, type, duration);
    },

    /**
     * Muestra una notificación de éxito
     */
    success: (message) => Notifications.show(message, 'success'),

    /**
     * Muestra una notificación de error
     */
    error: (message) => Notifications.show(message, 'error'),

    /**
     * Muestra una notificación de advertencia
     */
    warning: (message) => Notifications.show(message, 'warning'),

    /**
     * Muestra una notificación informativa
     */
    info: (message) => Notifications.show(message, 'info')
};