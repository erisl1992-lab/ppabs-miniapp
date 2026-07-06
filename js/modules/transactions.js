// transactions.js - Historial de transacciones
import { API } from '../api.js';
import { Telegram } from '../telegram.js';
import { Utils } from '../utils.js';
import { Notifications } from '../notifications.js';

export const Transactions = {
    title: '📋 Historial',

    render: () => {
        return `
            <div id="transactions-section">
                <div style="margin-bottom:16px;">
                    <select id="tx-filter-status" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-color);color:var(--text-color);">
                        <option value="">Todos los estados</option>
                        <option value="VALIDANDO">🟠 Validando</option>
                        <option value="EN_PROCESO">🟢 En Proceso</option>
                        <option value="PROCESO_MANUAL">🟡 Proceso Manual</option>
                        <option value="COMPLETADO">✅ Completado</option>
                        <option value="CANCELADO">🔴 Cancelado</option>
                    </select>
                </div>
                <div id="tx-list">
                    <p style="color:var(--text-muted);text-align:center;padding:20px;">Cargando...</p>
                </div>
            </div>
        `;
    },

    init: async () => {
        const userId = Telegram.getUserId();
        await Transactions._loadTransactions(userId);

        // Filtro
        document.getElementById('tx-filter-status').addEventListener('change', () => {
            Transactions._loadTransactions(userId);
        });
    },

    _loadTransactions: async (userId) => {
        const filterStatus = document.getElementById('tx-filter-status').value;
        const params = { user_id: userId };
        if (filterStatus) params.status = filterStatus;

        try {
            const data = await API.transactions.list(params);
            const txs = data.transactions || [];

            const list = document.getElementById('tx-list');
            if (txs.length === 0) {
                list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No hay transacciones</p>';
                return;
            }

            list.innerHTML = txs.map(tx => `
                <div class="transaction-item">
                    <div class="tx-info">
                        <span style="font-weight:600;">${Utils.truncate(tx.transaction_id, 12)}</span>
                        <span class="tx-date">${Utils.formatDate(tx.fecha_creacion)}</span>
                        <span class="tx-amount">${Utils.formatCurrency(tx.amount_usd)}</span>
                    </div>
                    <div>
                        <span class="tx-status ${Utils.getStatusClass(tx.status)}">
                            ${Utils.getStatusEmoji(tx.status)} ${tx.status}
                        </span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            Notifications.error('Error al cargar transacciones');
            document.getElementById('tx-list').innerHTML = `
                <p style="color:var(--danger);text-align:center;padding:20px;">Error al cargar</p>
            `;
        }
    }
};