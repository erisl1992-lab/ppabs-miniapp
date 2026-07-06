// toast.js - Notificaciones tipo toast
export const Toast = {
    _container: null,

    init: () => {
        Toast._container = document.getElementById('toast-container');
        if (!Toast._container) {
            Toast._container = document.createElement('div');
            Toast._container.id = 'toast-container';
            document.body.appendChild(Toast._container);
        }
    },

    /**
     * Muestra un toast
     */
    show: (message, type = 'info', duration = 3000) => {
        if (!Toast._container) Toast.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;

        Toast._container.appendChild(toast);

        // Animación de entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Cerrar al hacer clic
        toast.querySelector('.toast-close').addEventListener('click', () => {
            Toast._removeToast(toast);
        });

        // Auto-cerrar
        if (duration > 0) {
            setTimeout(() => {
                Toast._removeToast(toast);
            }, duration);
        }

        return toast;
    },

    _removeToast: (toast) => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
};