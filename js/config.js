// config.js - Configuración global
const CONFIG = {
    // ===== URL DEL BACKEND =====
    API_BASE_URL: 'https://ppabs-backend-production.up.railway.app/api', // 

    // ===== PAYPAL =====
    PAYPAL_CLIENT_ID: 'ATgqwZuE58Vd0FT7HkYVTrM4o7DUXb7trhlhPYaVc3MxQA8ybs-MUy1a0LhJ7ygFDFbJdRxjkzXatdCG', // 

    // ===== TELEGRAM =====
    TELEGRAM_BOT_USERNAME: 'ppabsminiappbot', // 

    // ===== APPS SCRIPT (para compatibilidad) =====
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwuzdJh2mHjDzizey1JaZpIZ_xj7MjsVWNYzhyIZvJljlG2zTiiT5ALjlfBOM4CEPjbrg/exec
',

    // ===== TASA DE CAMBIO POR DEFECTO =====
    DEFAULT_RATE: 00.00,

    // ===== ESTADOS =====
    STATUSES: {
        VALIDANDO: { label: 'Validando', emoji: '🟠' },
        EN_PROCESO: { label: 'En Proceso', emoji: '🟢' },
        PROCESO_MANUAL: { label: 'Proceso Manual', emoji: '🟡' },
        COMPLETADO: { label: 'Completado', emoji: '✅' },
        CANCELADO: { label: 'Cancelado', emoji: '🔴' }
    }
};

// No modificar
Object.freeze(CONFIG);