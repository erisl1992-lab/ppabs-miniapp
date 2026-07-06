// accounts.js - Gestión de métodos de pago
import { API } from '../api.js';
import { Telegram } from '../telegram.js';
import { Notifications } from '../notifications.js';
import { Modal } from '../components/modal.js';
import { Loading } from '../components/loading.js';

export const Accounts = {
    title: '🏦 Cuentas',

    render: () => {
        return `
            <div id="accounts-section">
                <div id="accounts-list">
                    <p style="color:var(--text-muted);text-align:center;padding:20px;">Cargando...</p>
                </div>
                <button id="btn-add-account" class="add-account-btn">➕ Agregar método de pago</button>
            </div>
        `;
    },

    init: async () => {
        await Accounts._loadAccounts();

        document.getElementById('btn-add-account').addEventListener('click', () => {
            Accounts._showAddModal();
        });
    },

    _loadAccounts: async () => {
        const userId = Telegram.getUserId();
        try {
            const data = await API.accounts.list(userId);
            const list = document.getElementById('accounts-list');

            if (!data.methods || data.methods.length === 0) {
                list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No hay métodos guardados</p>';
                return;
            }

            list.innerHTML = data.methods.map(acc => `
                <div class="account-item">
                    <div>
                        <div class="label">${acc.label || acc.type}</div>
                        <div class="type">${acc.type} ${acc.is_default ? '⭐' : ''}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary" style="font-size:12px;padding:4px 12px;" data-account-id="${acc.id}">✏️</button>
                        <button class="btn btn-danger" style="font-size:12px;padding:4px 12px;" data-account-id="${acc.id}">🗑️</button>
                    </div>
                </div>
            `).join('');

            // Eventos para editar/eliminar (simplificado)
            list.querySelectorAll('[data-account-id]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.accountId;
                    if (e.target.textContent.includes('🗑️')) {
                        Accounts._deleteAccount(id);
                    } else {
                        Notifications.info('Edición disponible próximamente');
                    }
                });
            });
        } catch (error) {
            Notifications.error('Error al cargar métodos de pago');
        }
    },

    _showAddModal: () => {
        Modal.open(`
            <h3 style="margin-bottom:16px;">➕ Agregar método de pago</h3>
            <form id="add-account-form">
                <div class="form-group">
                    <label>Tipo</label>
                    <select id="acc-type" class="input-field">
                        <option value="pago_movil">Pago Móvil</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="ubii">Ubii</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Etiqueta</label>
                    <input type="text" id="acc-label" class="input-field" placeholder="Mi cuenta principal" />
                </div>
                <div class="form-group">
                    <label>Detalles (JSON)</label>
                    <textarea id="acc-details" class="input-field" rows="3" placeholder='{"banco":"Banesco","cuenta":"123456"}'></textarea>
                </div>
                <div style="display:flex;gap:10px;margin-top:16px;">
                    <label><input type="checkbox" id="acc-default" /> Predeterminado</label>
                </div>
                <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        `);

        document.getElementById('add-account-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                user_id: Telegram.getUserId(),
                type: document.getElementById('acc-type').value,
                label: document.getElementById('acc-label').value.trim() || 'Mi cuenta',
                details: JSON.parse(document.getElementById('acc-details').value || '{}'),
                is_default: document.getElementById('acc-default').checked
            };

            Loading.show('Guardando...');
            try {
                await API.accounts.create(data);
                Notifications.success('Método de pago guardado');
                Modal.close();
                await Accounts._loadAccounts();
            } catch (error) {
                Notifications.error('Error al guardar: ' + error.message);
            } finally {
                Loading.hide();
            }
        });
    },

    _deleteAccount: async (id) => {
        Modal.confirm('¿Eliminar este método de pago?', async () => {
            Loading.show('Eliminando...');
            try {
                await API.accounts.delete(id, Telegram.getUserId());
                Notifications.success('Método eliminado');
                await Accounts._loadAccounts();
            } catch (error) {
                Notifications.error('Error al eliminar');
            } finally {
                Loading.hide();
            }
        });
    }
};