// router.js - Navegación entre secciones con control de KYC y Telegram
import { Header } from './components/header.js';
import { Menu } from './modules/menu.js';
import { Splash } from './components/splash.js';
import { storage } from './storage.js';
import { telegram } from './telegram.js';

export const Router = {
    _currentRoute: null,
    _routes: {},

    /**
     * Registra las rutas disponibles y arranca la app
     */
    init: async () => {
        // 1. Configurar Telegram
        if (tg) {
            tg.expand();
            tg.ready();
            // Escuchar cambios de tema
            tg.onEvent('themeChanged', () => {
                document.documentElement.setAttribute('data-theme', tg.colorScheme || 'light');
            });
        }

        // 2. Registrar rutas (mapeo nombre → función importadora)
        Router._routes = {
            dashboard: () => import('./modules/dashboard.js').then(m => m.Dashboard),
            kyc: () => import('./modules/kyc.js').then(m => m.KYC),
            paypal: () => import('./modules/paypal.js').then(m => m.PayPal),
            profile: () => import('./modules/profile.js').then(m => m.Profile),
            transactions: () => import('./modules/transactions.js').then(m => m.Transactions),
            accounts: () => import('./modules/accounts.js').then(m => m.Accounts),
            calculator: () => import('./modules/calculator.js').then(m => m.Calculator)
        };

        // 3. Navegación por hash (URL)
        window.addEventListener('hashchange', () => {
            const route = window.location.hash.replace('#', '') || 'dashboard';
            Router.navigate(route, { fromHash: true });
        });

        // 4. Navegación por menú (evento custom)
        document.addEventListener('menu-navigate', (e) => {
            Router.navigate(e.detail.route);
        });

        // 5. Mostrar Splash mientras se carga el perfil
        Splash.show('Cargando perfil...');
        try {
            // Verificar si el usuario tiene KYC aprobado
            const user = await storage.getUser();
            Router._user = user;
        } catch (error) {
            console.warn('Error al cargar perfil:', error);
        }
        Splash.hide();

        // 6. Navegar a la ruta inicial (o a KYC si no está aprobado)
        const initial = window.location.hash.replace('#', '') || 'dashboard';
        Router.navigate(initial);
    },

    /**
     * Navega a una ruta (con verificación de KYC)
     */
    navigate: async (route, options = {}) => {
        if (Router._currentRoute === route && !options.force) return;

        // --- VERIFICACIÓN DE KYC ---
        const publicRoutes = ['kyc', 'dashboard', 'profile'];
        const user = Router._user || await storage.getUser();

        // Si la ruta NO es pública y el usuario no tiene KYC aprobado, redirigir a KYC
        if (!publicRoutes.includes(route) && (!user || user.kycStatus !== 'APROBADO')) {
            console.warn(`🔒 Ruta protegida: ${route}. Redirigiendo a KYC.`);
            window.location.hash = 'kyc';
            route = 'kyc';
        }

        // --- OBTENER MÓDULO ---
        const loader = Router._routes[route];
        if (!loader) {
            console.error(`Ruta no registrada: ${route}`);
            return;
        }

        try {
            const Module = await loader();
            Router._currentRoute = route;

            // Actualizar hash (si no viene de un cambio de hash)
            if (!options.fromHash) {
                window.location.hash = route;
            }

            // Renderizar Header
            Header.render(Module.title || 'PPABS');

            // Renderizar contenido principal
            const main = document.getElementById('app-main');
            if (Module.render) {
                main.innerHTML = await Module.render(user);
            } else {
                main.innerHTML = '<p>Módulo en construcción</p>';
            }

            // Renderizar menú (solo si está visible)
            Menu.render(route, user);

            // Inicializar el módulo (si tiene init)
            if (Module.init && typeof Module.init === 'function') {
                await Module.init(user);
            }

            // Actualizar botón "Atrás" de Telegram
            if (tg && tg.BackButton) {
                if (route !== 'dashboard') {
                    tg.BackButton.show();
                    tg.BackButton.onClick(() => {
                        window.history.back();
                    });
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

    /**
     * Obtiene la ruta actual
     */
    getCurrentRoute: () => Router._currentRoute
};