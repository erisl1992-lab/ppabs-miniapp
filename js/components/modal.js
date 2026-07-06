// modal.js - Modal genérico
export const Modal = {
    _overlay: null,
    _content: null,

    init: () => {
        Modal._overlay = document.getElementById('global-modal');
        Modal._content = Modal._overlay?.querySelector('.modal-content');
    },

    /**
     * Abre un modal con contenido HTML
     */
    open: (html, options = {}) => {
        if (!Modal._overlay) Modal.init();
        if (!Modal._overlay) return;

        Modal._content.innerHTML = html;
        Modal._overlay.style.display = 'flex';

        if (options.onClose) {
            const closeBtn = Modal._overlay.querySelector('[data-modal-close]');
            if (closeBtn) {
                closeBtn.addEventListener('click', Modal.close);
            }
        }

        // Cerrar al hacer clic fuera
        if (options.closeOnOverlay !== false) {
            Modal._overlay.addEventListener('click', (e) => {
                if (e.target === Modal._overlay) Modal.close();
            });
        }
    },

    /**
     * Cierra el modal
     */
    close: () => {
        if (Modal._overlay) {
            Modal._overlay.style.display = 'none';
            Modal._content.innerHTML = '';
        }
    },

    /**
     * Abre un modal de confirmación simple
     */
    confirm: (message, onConfirm) => {
        Modal.open(`
            <div style="padding:10px 0;">
                <p style="margin-bottom:20px;">${message}</p>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button class="btn btn-secondary" data-modal-close>Cancelar</button>
                    <button id="modal-confirm-btn" class="btn btn-primary">Confirmar</button>
                </div>
            </div>
        `);

        document.getElementById('modal-confirm-btn')?.addEventListener('click', () => {
            Modal.close();
            if (onConfirm) onConfirm();
        });
    }
};