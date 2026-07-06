// paypal.js - Integración con PayPal
import { CONFIG } from '../config.js';
import { API } from '../api.js';
import { Telegram } from '../telegram.js';
import { Notifications } from '../notifications.js';
import { PDF } from '../pdf.js';
import { Loading } from '../components/loading.js';

export const PayPal = {
    title: '💳 Pagar',

    render: () => {
        return `
            <div id="paypal-section">
                <div class="info-card" style="background:var(--bg-color);padding:16px;border-radius:var(--radius-sm);margin-bottom:16px;">
                    <p style="font-size:14px;color:var(--text-muted);">
                        💰 Tasa de cambio: <strong id="paypal-rate">42.00</strong> Bs/USD
                    </p>
                </div>

                <div class="form-group">
                    <label>Monto en USD</label>
                    <input type="number" id="paypal-amount" value="10.00" min="1" step="0.01" />
                </div>

                <div class="info-card" style="background:var(--bg-color);padding:12px;border-radius:var(--radius-sm);margin-top:8px;">
                    <p style="display:flex;justify-content:space-between;">
                        <span>Total en Bs:</span>
                        <strong id="paypal-total-bs">420.00</strong>
                    </p>
                </div>

                <div id="paypal-button-container" class="disabled"></div>
                <p class="paypal-info">🔒 Pagos seguros vía PayPal</p>

                <div id="paypal-success" style="display:none;margin-top:16px;padding:16px;background:var(--status-completado-bg);border-radius:var(--radius-sm);text-align:center;">
                    <p style="font-weight:bold;color:var(--status-completado-text);">✅ ¡Pago completado!</p>
                    <button id="btn-download-receipt" class="btn btn-primary" style="margin-top:12px;">📥 Descargar recibo</button>
                </div>
            </div>
        `;
    },

    init: () => {
        const amountInput = document.getElementById('paypal-amount');
        const rateSpan = document.getElementById('paypal-rate');
        const totalSpan = document.getElementById('paypal-total-bs');

        // Cargar tasa de cambio
        PayPal._loadRate(rateSpan);

        // Actualizar cálculo
        amountInput.addEventListener('input', () => {
            const amount = parseFloat(amountInput.value) || 0;
            const rate = parseFloat(rateSpan.textContent) || 42;
            totalSpan.textContent = (amount * rate).toFixed(2);
        });

        // Cargar PayPal
        PayPal._loadPayPal();
    },

    _loadRate: async (span) => {
        try {
            const data = await API.hours.get(); // Usamos horas para obtener tasa (o endpoint específico)
            // Si el backend devuelve tasa, la usamos. Por ahora usamos CONFIG.
            const rate = CONFIG.DEFAULT_RATE;
            span.textContent = rate.toFixed(2);
        } catch (e) {
            span.textContent = CONFIG.DEFAULT_RATE.toFixed(2);
        }
    },

    _loadPayPal: () => {
        const container = document.getElementById('paypal-button-container');
        const amountInput = document.getElementById('paypal-amount');

        // Esperar a que PayPal SDK esté disponible
        if (typeof paypal === 'undefined') {
            container.innerHTML = '<p style="color:var(--danger);">❌ PayPal no disponible</p>';
            return;
        }

        paypal.Buttons({
            style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },

            createOrder: (data, actions) => {
                const amount = parseFloat(amountInput.value) || 10;
                if (amount < 1) {
                    Notifications.error('Monto mínimo $1 USD');
                    return;
                }

                const userId = Telegram.getUserId();
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: amount.toFixed(2), currency_code: 'USD' },
                        description: `PPABS - Usuario ${userId}`
                    }]
                });
            },

            onApprove: async (data, actions) => {
                Loading.show('Procesando pago...');
                try {
                    const details = await actions.order.capture();
                    const txId = details.purchase_units[0].payments.captures[0].id;
                    const amount = details.purchase_units[0].amount.value;
                    const userId = Telegram.getUserId();

                    // Registrar transacción en backend
                    const result = await API.transactions.create({
                        user_id: userId,
                        amount_usd: amount,
                        paypal_tx_id: txId
                    });

                    if (result.success) {
                        Notifications.success('✅ Pago completado con éxito');
                        document.getElementById('paypal-success').style.display = 'block';
                        document.getElementById('paypal-button-container').style.display = 'none';

                        // Guardar datos para recibo
                        window._lastTransaction = result;

                        // Botón descargar
                        document.getElementById('btn-download-receipt').addEventListener('click', () => {
                            PayPal._generateReceipt(result);
                        });
                    }
                } catch (error) {
                    Notifications.error('Error al procesar el pago: ' + error.message);
                } finally {
                    Loading.hide();
                }
            },

            onCancel: () => {
                Notifications.info('Pago cancelado');
            },

            onError: (err) => {
                Notifications.error('Error en PayPal: ' + err.message);
            }
        }).render('#paypal-button-container');

        // Activar botón (quitar disabled)
        container.classList.remove('disabled');
    },

    _generateReceipt: (transaction) => {
        const user = Telegram.getUser();
        PDF.generateReceipt(transaction, {
            nombre: user?.first_name || 'Usuario'
        }).then(() => {
            Notifications.success('Recibo descargado');
        }).catch((err) => {
            Notifications.error('Error al generar recibo: ' + err.message);
        });
    }
};