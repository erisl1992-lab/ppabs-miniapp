// api.js - Cliente para el backend
import { CONFIG } from './config.js';
import { Storage } from './storage.js';

export const API = {
    /**
     * Realiza una petición al backend con autenticación opcional
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = Storage.get('adminToken');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Si hay token, añadirlo al header (para rutas de admin)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            if (!response.ok) {
                const errorMsg = data.error || data.message || `HTTP ${response.status}`;
                throw new Error(errorMsg);
            }
            return data;
        } catch (error) {
            console.error(`[API] Error en ${endpoint}:`, error);
            throw error;
        }
    },

    // ===== KYC =====
    kyc: {
        register: (data) => API.request('/kyc/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        get: (telegramId) => API.request(`/kyc/${telegramId}`),
        update: (kycId, status) => API.request(`/kyc/${kycId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        listAll: () => API.request('/kyc', {}) // El token se añade automáticamente si existe
    },

    // ===== TRANSACCIONES =====
    transactions: {
        create: (data) => API.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        get: (id) => API.request(`/transactions/${id}`),
        list: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.request(`/transactions${query ? '?' + query : ''}`);
        },
        updateStatus: (id, status) => API.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        })
    },

    // ===== MÉTODOS DE PAGO =====
    accounts: {
        list: (userId) => API.request(`/payment-methods/${userId}`),
        create: (data) => API.request('/payment-methods', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (methodId, data) => API.request(`/payment-methods/${methodId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (methodId, userId) => API.request(`/payment-methods/${methodId}`, {
            method: 'DELETE',
            body: JSON.stringify({ user_id: userId })
        })
    },

    // ===== HORARIOS =====
    hours: {
        get: () => API.request('/service-hours'),
        update: (hours) => API.request('/service-hours', {
            method: 'PUT',
            body: JSON.stringify({ hours })
        })
    },

    // ===== AUTENTICACIÓN =====
    auth: {
        login: (username, password) => API.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),
        verify: () => API.request('/auth/verify')
    }
};