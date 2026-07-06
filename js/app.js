// app.js - Punto de entrada principal
import { Router } from './router.js';
import { Telegram } from './telegram.js';
import { Storage } from './storage.js';
import { CONFIG } from './config.js';

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PPABS WebApp iniciando...');

    // 1. Inicializar Telegram
    const tg = Telegram.init();
    if (tg) {
        console.log('✅ Telegram WebApp conectado');
    } else {
        console.warn('⚠️ Modo demo sin Telegram');
    }

    // 2. Cargar configuración
    console.log('📡 API Base:', CONFIG.API_BASE_URL);

    // 3. Inicializar Router
    Router.init();

    // 4. Evento de cierre
    document.addEventListener('close-app', () => {
        Telegram.close();
    });

    console.log('✅ PPABS WebApp listo');
});

// ===== EXPONER PARA DEBUG =====
window.__PPABS = {
    CONFIG,
    Router,
    Telegram,
    Storage
};