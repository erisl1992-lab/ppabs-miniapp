// splash.js - Pantalla de carga
export const Splash = {
    _element: null,

    show: () => {
        const el = document.getElementById('splash-screen');
        if (el) {
            el.classList.remove('fade-out');
        }
    },

    hide: () => {
        const el = document.getElementById('splash-screen');
        if (el) {
            el.classList.add('fade-out');
        }
    }
};