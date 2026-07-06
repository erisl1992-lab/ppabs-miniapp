// router.js - Navegación entre secciones
import { Header } from './components/header.js';
import { Menu } from './modules/menu.js';
import { Splash } from './components/splash.js';
import { Storage } from './storage.js';
import { Telegram } from './telegram.js';

export const Router = {
    _currentRoute: null,
    _routes: {},
    _user: null,

    init: async () => {
        // 1. Configurar Telegram
        const tg = Telegram._instance || Telegram.init();
        if (tg) {
            tg.expand();
            tg.ready();
            tg.onEvent('themeChanged', () => {
                document.documentElement.setAttribute('data-theme', tg.colorScheme || 'light');
            });
        }

        // 2. Registrar rutas
        Router._routes = {
            dashboard: () => import('./modules/dashboard.js').then(m => m.Dashboard),
            kyc: () => import('./modules/kyc.js').then(m => m.KYC),
            paypal: () => import('./modules/paypal.js').then(m => m.PayPal),
            profile: () => import('./modules/profile.js').then(m => m.Profile),
            transactions: () => import('./modules/transactions.js').then(m => m.Transactions),
            accounts: () => import('./modules/accounts.js').then(m => m.Accounts),
            calculator: () => import('./modules/calculator.js').then(m => m.Calculator)
        };

        // 3. Navegación por hash
        window.addEventListener('hashchange', () => {
            const route = window.location.hash.replace('#', '') || 'dashboard';
            Router.navigate(route, { fromHash: true });
        });

        // 4. Navegación por menú
        document.addEventListener('menu-navigate', (e) => {
            Router.navigate(e.detail.route);
        });

        // 5. Cargar perfil de usuario
        Splash.show('Cargando perfil...');
        try {
            Router._user = Storage.get('user') || null;
        } catch (error) {
            console.warn('Error al cargar perfil:', error);
        }
        Splash.hide();

        // 6. Navegar a la ruta inicial
        const initial = window.location.hash.replace('#', '') || 'dashboard';
        Router.navigate(initial);
    },

    navigate: async (route, options = {}) => {
        if (Router._currentRoute === route && !options.force) return;

        const publicRoutes = ['kyc', 'dashboard', 'profile'];
        const user = Router._user || Storage.get('user');

        // Verificar KYC
        if (!publicRoutes.includes(route) && (!user || user.kycStatus !== 'APROBADO')) {
            console.warn(`🔒 Ruta protegida: ${route}. Redirigiendo a KYC.`);
            window.location.hash = 'kyc';
            route = 'kyc';
        }

        const loader = Router._routes[route];
        if (!loader) {
            console.error(`Ruta no registrada: ${route}`);
            return;
        }

        try {
            const Module = await loader();
            Router._currentRoute = route;

            if (!options.fromHash) {
                window.location.hash = route;
            }

            Header.render(Module.title || 'PPABS');

            const main = document.getElementById('app-main');
            main.innerHTML = Module.render ? await Module.render(user) : '<p>Módulo en construcción</p>';

            Menu.render(route, user);

            if (Module.init && typeof Module.init === 'function') {
                await Module.init(user);
            }

            // Botón atrás de Telegram
            const tg = Telegram._instance;
            if (tg && tg.BackButton) {
                if (route !== 'dashboard') {
                    tg.BackButton.show();
                    tg.BackButton.onClick(() => window.history.back());
                } else {
                    tg.BackButton.hide();
                }
            }

        } catch (error) {
            console.error(`Error al cargar el módulo "${route}":`, error);
            const main = document.getElementById('app-main');
            main.innerHTML = `
                <div style="padding:40px;text-align:center;color:var(--danger);">
                    <h3>⚠️ Error al cargar la sección</h3>
                    <p>${error.message || 'Intenta nuevamente más tarde.'}</p>
                    <button onclick="location.reload()" style="margin-top:15px;padding:10px 20px;background:var(--accent);color:white;border:none;border-radius:6px;">Recargar</button>
                </div>
            `;
        }
    },

    getCurrentRoute: () => Router._currentRoute
};