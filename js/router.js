// router.js - Navegación entre secciones (versión mejorada)
import { Header } from './components/header.js';
import { Menu } from './modules/menu.js';
import { Splash } from './components/splash.js';
import { Storage } from './storage.js';
import { Telegram } from './telegram.js';
import { Notification } from './notification.js';

export const Router = {
    _currentRoute: null,
    _routes: {},
    _user: null,
    _isLoading: false,

    init: async () => {
        // 1. Configurar Telegram
        const tg = Telegram.init();
        if (tg) {
            try {
                tg.expand();
                tg.ready();
                tg.onEvent('themeChanged', () => {
                    document.documentElement.setAttribute('data-theme', tg.colorScheme || 'light');
                });
            } catch (e) {
                console.warn('Error al configurar Telegram:', e);
            }
        }

        // 2. Registrar rutas (con nombres de módulo)
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

        // 5. Escuchar cambios en el estado del usuario (para actualizar el menú)
        document.addEventListener('user-updated', (e) => {
            Router._user = e.detail.user || Storage.get('user');
            // Recargar el menú si la ruta actual lo requiere
            const currentRoute = Router.getCurrentRoute();
            if (currentRoute) {
                Menu.render(currentRoute, Router._user);
            }
        });

        // 6. Cargar perfil de usuario
        Splash.show('Cargando perfil...');
        try {
            Router._user = Storage.get('user') || null;
            console.log('👤 Usuario cargado:', Router._user);
        } catch (error) {
            console.warn('Error al cargar perfil:', error);
        }
        Splash.hide();

        // 7. Navegar a la ruta inicial (o a KYC si no tiene perfil)
        const initial = window.location.hash.replace('#', '') || 'dashboard';
        Router.navigate(initial);
    },

    /**
     * Navega a una ruta con verificación de KYC y manejo de errores
     */
    navigate: async (route, options = {}) => {
        // Evitar navegación redundante
        if (Router._currentRoute === route && !options.force) return;

        // Evitar múltiples navegaciones simultáneas
        if (Router._isLoading) {
            console.warn('⏳ Ya hay una navegación en curso, espera...');
            return;
        }

        Router._isLoading = true;

        try {
            // --- 1. Verificar KYC ---
            const publicRoutes = ['kyc', 'dashboard', 'profile'];
            const user = Router._user || Storage.get('user');

            // Si la ruta es protegida y el usuario no tiene KYC aprobado, redirigir a KYC
            if (!publicRoutes.includes(route) && (!user || user.kycStatus !== 'APROBADO')) {
                console.warn(`🔒 Ruta protegida: ${route}. Redirigiendo a KYC.`);
                window.location.hash = 'kyc';
                route = 'kyc';
            }

            // --- 2. Cargar el módulo ---
            const loader = Router._routes[route];
            if (!loader) {
                console.error(`❌ Ruta no registrada: ${route}`);
                Notification.error(`La sección "${route}" no existe.`);
                Router._isLoading = false;
                return;
            }

            // Mostrar indicador de carga (opcional)
            const main = document.getElementById('app-main');
            main.innerHTML = `
                <div style="display:flex;justify-content:center;align-items:center;height:200px;">
                    <div style="text-align:center;">
                        <div class="splash-loader" style="margin:0 auto 12px;width:32px;height:32px;border:3px solid var(--border-color);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                        <p style="color:var(--text-secondary);">Cargando...</p>
                    </div>
                </div>
            `;

            // --- 3. Ejecutar el módulo ---
            const Module = await loader();
            Router._currentRoute = route;

            // Actualizar hash (si no viene de un cambio de hash)
            if (!options.fromHash) {
                window.location.hash = route;
            }

            // Renderizar Header
            Header.render(Module.title || 'PPABS');

            // Renderizar contenido principal
            if (Module.render) {
                main.innerHTML = await Module.render(user);
            } else {
                main.innerHTML = '<p>Módulo en construcción</p>';
            }

            // Renderizar menú
            Menu.render(route, user);

            // Inicializar el módulo (si tiene init)
            if (Module.init && typeof Module.init === 'function') {
                await Module.init(user);
            }

            // --- 4. Configurar botón "Atrás" de Telegram (con soporte para versiones antiguas) ---
            const tg = Telegram._instance;
            if (tg) {
                try {
                    // Verificar si BackButton está disponible (versión >= 7.0)
                    if (tg.BackButton && typeof tg.BackButton.show === 'function') {
                        if (route !== 'dashboard') {
                            tg.BackButton.show();
                            tg.BackButton.onClick(() => {
                                window.history.back();
                            });
                        } else {
                            tg.BackButton.hide();
                        }
                    } else {
                        // Versión antigua, ignorar
                        console.debug('BackButton no soportado en esta versión de Telegram');
                    }
                } catch (e) {
                    // Silenciar errores de BackButton (no críticos)
                    console.debug('Error al configurar BackButton:', e.message);
                }
            }

        } catch (error) {
            console.error(`❌ Error al cargar el módulo "${route}":`, error);
            const main = document.getElementById('app-main');
            main.innerHTML = `
                <div style="padding:40px;text-align:center;color:var(--danger);">
                    <h3>⚠️ Error al cargar la sección</h3>
                    <p>${error.message || 'Intenta nuevamente más tarde.'}</p>
                    <button onclick="location.reload()" style="margin-top:15px;padding:10px 20px;background:var(--accent);color:white;border:none;border-radius:6px;cursor:pointer;">
                        🔄 Recargar
                    </button>
                </div>
            `;
            Notification.error('Error al cargar la sección: ' + (error.message || 'Error desconocido'));
        } finally {
            Router._isLoading = false;
        }
    },

    /**
     * Obtiene la ruta actual
     */
    getCurrentRoute: () => Router._currentRoute,

    /**
     * Actualiza el estado del usuario (para usar después de cambios en KYC)
     */
    updateUser: (user) => {
        Router._user = user;
        Storage.set('user', user);
        document.dispatchEvent(new CustomEvent('user-updated', { detail: { user } }));
    }
};