// menu.js - Menú inferior con opciones dinámicas según estado KYC
export const Menu = {
    _items: [
        { route: 'dashboard', icon: '📊', label: 'Inicio', public: true },
        { route: 'paypal', icon: '💳', label: 'Pagar', public: false },
        { route: 'transactions', icon: '📋', label: 'Historial', public: false },
        { route: 'calculator', icon: '🧮', label: 'Calcular', public: true },
        { route: 'accounts', icon: '🏦', label: 'Cuentas', public: false },
        { route: 'profile', icon: '👤', label: 'Perfil', public: true }
    ],

    /**
     * Renderiza el menú inferior
     * @param {string} activeRoute - Ruta actual
     * @param {object} user - Datos del usuario (para saber si tiene KYC)
     */
    render: (activeRoute, user = null) => {
        const menu = document.getElementById('app-menu');
        if (!menu) return;

        // Filtrar items según KYC (solo si el usuario está logueado)
        const isKycApproved = user && user.kycStatus === 'APROBADO';
        const visibleItems = Menu._items.filter(item => 
            item.public || isKycApproved
        );

        // Construir HTML
        menu.innerHTML = visibleItems.map(item => {
            const isActive = activeRoute === item.route;
            return `
                <div class="menu-item" data-route="${item.route}" style="
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    padding:6px 12px;
                    cursor:pointer;
                    opacity: ${isActive ? 1 : 0.5};
                    transform: ${isActive ? 'scale(1.05)' : 'scale(1)'};
                    transition: all 0.2s ease;
                    font-size:11px;
                    color: var(--text-color);
                    border-radius:8px;
                    background: ${isActive ? 'var(--card-bg)' : 'transparent'};
                    min-width:60px;
                ">
                    <span style="font-size:22px;line-height:1.2;">${item.icon}</span>
                    <span style="margin-top:2px;font-weight:${isActive ? '600' : '400'};">${item.label}</span>
                </div>
            `;
        }).join('');

        // Asignar eventos de clic
        menu.querySelectorAll('.menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const route = el.dataset.route;
                // Evitar navegar a la misma ruta
                if (route === activeRoute) return;
                document.dispatchEvent(new CustomEvent('menu-navigate', {
                    detail: { route }
                }));
            });
        });
    }
};