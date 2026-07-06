// loading.js - Indicador de carga
export const Loading = {
    _overlay: null,

    /**
     * Muestra un overlay de carga
     */
    show: (message = 'Cargando...') => {
        if (Loading._overlay) {
            Loading._overlay.remove();
        }

        Loading._overlay = document.createElement('div');
        Loading._overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            backdrop-filter: blur(4px);
        `;
        Loading._overlay.innerHTML = `
            <div style="
                background: var(--container-bg);
                padding: 30px 40px;
                border-radius: var(--radius);
                text-align: center;
                box-shadow: var(--shadow-lg);
            ">
                <div class="splash-loader" style="margin:0 auto 16px;"></div>
                <p style="color:var(--text-color);font-weight:600;">${message}</p>
            </div>
        `;
        document.body.appendChild(Loading._overlay);
    },

    /**
     * Oculta el overlay
     */
    hide: () => {
        if (Loading._overlay) {
            Loading._overlay.remove();
            Loading._overlay = null;
        }
    }
};