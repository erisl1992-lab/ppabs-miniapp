// profile.js - Perfil de usuario
import { Telegram } from '../telegram.js';
import { API } from '../api.js';
import { Utils } from '../utils.js';

export const Profile = {
    title: '👤 Perfil',

    render: () => {
        return `
            <div id="profile-section">
                <div class="profile-avatar" id="profile-avatar">U</div>
                <div style="text-align:center;margin-bottom:20px;">
                    <h2 id="profile-name">Usuario</h2>
                    <p style="color:var(--text-muted);font-size:14px;" id="profile-id">ID: ---</p>
                </div>

                <div class="profile-field">
                    <span class="label">Estado KYC</span>
                    <span class="value" id="profile-kyc-status">Cargando...</span>
                </div>
                <div class="profile-field">
                    <span class="label">Transacciones</span>
                    <span class="value" id="profile-tx-count">0</span>
                </div>
                <div class="profile-field">
                    <span class="label">Monto total</span>
                    <span class="value" id="profile-total">$0</span>
                </div>

                <button id="btn-close-app-profile" class="btn btn-danger" style="width:100%;margin-top:20px;">
                    🔒 Cerrar sesión
                </button>
            </div>
        `;
    },

    init: async () => {
        const user = Telegram.getUser();
        const userId = Telegram.getUserId();

        // Avatar
        const avatar = document.getElementById('profile-avatar');
        avatar.textContent = user?.first_name?.charAt(0) || 'U';

        // Nombre
        document.getElementById('profile-name').textContent = user?.first_name || 'Usuario';
        document.getElementById('profile-id').textContent = `ID: ${userId || '---'}`;

        try {
            // Cargar KYC
            const kycData = await API.kyc.get(userId);
            const statusMap = {
                'VALIDANDO': '🟠 Validando',
                'EN_PROCESO': '🟢 En Proceso',
                'PROCESO_MANUAL': '🟡 Proceso Manual',
                'COMPLETADO': '✅ Completado',
                'CANCELADO': '🔴 Cancelado'
            };
            document.getElementById('profile-kyc-status').textContent = statusMap[kycData.status] || kycData.status;

            // Cargar transacciones
            const txData = await API.transactions.list({ user_id: userId });
            const txs = txData.transactions || [];
            document.getElementById('profile-tx-count').textContent = txs.length;
            const total = txs.reduce((sum, t) => sum + parseFloat(t.amount_usd), 0);
            document.getElementById('profile-total').textContent = `$${total.toFixed(2)}`;
        } catch (e) {
            document.getElementById('profile-kyc-status').textContent = '❌ No registrado';
        }

        // Cerrar sesión
        document.getElementById('btn-close-app-profile').addEventListener('click', () => {
            document.dispatchEvent(new Event('close-app'));
        });
    }
};