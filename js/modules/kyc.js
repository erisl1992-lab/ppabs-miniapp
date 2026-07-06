// kyc.js - Registro y gestión KYC
import { API } from '../api.js';
import { Telegram } from '../telegram.js';
import { Notifications } from '../notifications.js';
import { Utils } from '../utils.js';
import { Loading } from '../components/loading.js';

export const KYC = {
    title: '📋 KYC',

    render: () => {
        return `
            <div id="kyc-section">
                <div id="kyc-status-banner" class="kyc-status-banner review">
                    ⏳ Verificando tu estado...
                </div>

                <form id="kyc-form" class="kyc-form">
                    <div class="form-group">
                        <label>Nombre completo *</label>
                        <input type="text" id="kyc-nombre" placeholder="Juan Pérez" required />
                    </div>
                    <div class="form-group">
                        <label>Cédula / Pasaporte *</label>
                        <input type="text" id="kyc-cedula" placeholder="12345678" required />
                    </div>
                    <div class="form-group">
                        <label>Banco</label>
                        <input type="text" id="kyc-banco" placeholder="Banco del Este" />
                    </div>
                    <div class="form-group">
                        <label>Número de cuenta</label>
                        <input type="text" id="kyc-cuenta" placeholder="1234567890" />
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" id="kyc-telefono" placeholder="+584121234567" required />
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;">
                        📤 Enviar KYC
                    </button>
                </form>
            </div>
        `;
    },

    init: async () => {
        const userId = Telegram.getUserId();
        if (!userId) {
            document.getElementById('kyc-status-banner').textContent = '❌ No se pudo obtener tu ID de Telegram';
            return;
        }

        // Cargar estado actual
        await KYC._loadStatus(userId);

        // Evento submit
        document.getElementById('kyc-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await KYC._submitForm(userId);
        });
    },

    _loadStatus: async (userId) => {
        try {
            const data = await API.kyc.get(userId);
            const banner = document.getElementById('kyc-status-banner');
            const form = document.getElementById('kyc-form');

            if (data.status === 'COMPLETADO' || data.status === 'APROBADO') {
                banner.className = 'kyc-status-banner approved';
                banner.textContent = '✅ KYC aprobado. Ya puedes realizar transacciones.';
                form.style.display = 'none';
            } else if (data.status === 'CANCELADO' || data.status === 'RECHAZADO') {
                banner.className = 'kyc-status-banner rejected';
                banner.textContent = '❌ KYC rechazado. Contacta al administrador.';
                form.style.display = 'none';
            } else if (data.status === 'VALIDANDO' || data.status === 'EN_REVISIÓN') {
                banner.className = 'kyc-status-banner review';
                banner.textContent = '⏳ Tu KYC está en revisión. Espera la aprobación.';
                form.style.display = 'none';
            } else {
                banner.className = 'kyc-status-banner review';
                banner.textContent = '📝 Completa el formulario para registrar tu KYC.';
                form.style.display = 'block';
            }
        } catch (error) {
            // No encontrado - mostrar formulario
            const banner = document.getElementById('kyc-status-banner');
            banner.className = 'kyc-status-banner review';
            banner.textContent = '📝 Completa el formulario para registrar tu KYC.';
            document.getElementById('kyc-form').style.display = 'block';
        }
    },

    _submitForm: async (userId) => {
        const data = {
            telegram_id: userId,
            nombre: document.getElementById('kyc-nombre').value.trim(),
            cedula: document.getElementById('kyc-cedula').value.trim(),
            banco: document.getElementById('kyc-banco').value.trim(),
            cuenta: document.getElementById('kyc-cuenta').value.trim(),
            telefono: document.getElementById('kyc-telefono').value.trim()
        };

        // Validar campos obligatorios
        if (!data.nombre || !data.cedula || !data.telefono) {
            Notifications.error('Completa todos los campos obligatorios (*)');
            return;
        }

        Loading.show('Enviando KYC...');
        try {
            const result = await API.kyc.register(data);
            Notifications.success('KYC enviado correctamente. Espera la verificación.');
            await KYC._loadStatus(userId);
        } catch (error) {
            Notifications.error('Error al enviar KYC: ' + error.message);
        } finally {
            Loading.hide();
        }
    }
};