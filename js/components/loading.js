// loading.js - Indicador de carga
export const Loading = {
    _overlay: null,

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
            transition: opacity 0.3s;
        `;
        Loading._overlay.innerHTML = `
            <div style="
                background: var(--container-bg, #ffffff);
                padding: 30px 40px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                max-width: 300px;
            ">
                <div class="splash-loader" style="margin:0 auto 16px;width:40px;height:40px;border:4px solid var(--border-color, #e2e8f0);border-top-color:var(--accent, #0070ba);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                <p style="color:var(--text-color, #1a1a2e);font-weight:600;margin:0;">${message}</p>
            </div>
        `;
        document.body.appendChild(Loading._overlay);
    },

    hide: () => {
        if (Loading._overlay) {
            Loading._overlay.remove();
            Loading._overlay = null;
        }
    }
};