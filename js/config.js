// config.js - Configuración global
const CONFIG = {
    // ===== URL DEL BACKEND =====
    API_BASE_URL: 'https://ppabs-backend-production.up.railway.app/api', // 

    // ===== PAYPAL =====
    PAYPAL_CLIENT_ID: 'AYnEX-4Py6-3zwkh6VBPdMlUdcZZ_MPHwQ0RdoRlg-5D7NWpbz2lV4_9Oi6V57oA-5r__Zs_kXy_vi3V', // 

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