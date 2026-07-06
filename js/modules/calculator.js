// calculator.js - Calculadora de cambio
import { CONFIG } from '../config.js';

export const Calculator = {
    title: '🧮 Calculadora',

    render: () => {
        return `
            <div id="calculator-section">
                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <button id="calc-mode-bruto" class="btn btn-primary" style="flex:1;">Monto Bruto</button>
                    <button id="calc-mode-neto" class="btn btn-secondary" style="flex:1;">Monto Neto</button>
                </div>

                <div class="form-group">
                    <label id="calc-input-label">Monto en USD</label>
                    <input type="number" id="calc-input" value="10.00" step="0.01" min="0" />
                </div>

                <div style="background:var(--bg-color);padding:16px;border-radius:var(--radius-sm);">
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                        <span>Monto Bruto</span>
                        <span id="calc-bruto">$10.00</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                        <span>Comisión (5.4% + $0.30)</span>
                        <span id="calc-comision">$0.84</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
                        <span>Monto Neto</span>
                        <span id="calc-neto" style="font-weight:bold;color:var(--accent);">$9.16</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;">
                        <span>Total en Bs (tasa ${CONFIG.DEFAULT_RATE})</span>
                        <span id="calc-bs" style="font-weight:bold;color:var(--success);">384.72</span>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        const input = document.getElementById('calc-input');
        const modeBruto = document.getElementById('calc-mode-bruto');
        const modeNeto = document.getElementById('calc-mode-neto');

        let modo = 'bruto';
        const TASA = CONFIG.DEFAULT_RATE;

        const calcular = () => {
            const valor = parseFloat(input.value) || 0;
            let bruto = 0, comision = 0, neto = 0;

            if (modo === 'bruto') {
                bruto = valor;
                comision = (bruto * 0.054) + 0.30;
                neto = bruto - comision;
            } else {
                neto = valor;
                bruto = (neto + 0.30) / (1 - 0.054);
                comision = bruto - neto;
            }

            document.getElementById('calc-bruto').textContent = `$${bruto.toFixed(2)}`;
            document.getElementById('calc-comision').textContent = `$${comision.toFixed(2)}`;
            document.getElementById('calc-neto').textContent = `$${neto.toFixed(2)}`;
            document.getElementById('calc-bs').textContent = (neto * TASA).toFixed(2);
        };

        input.addEventListener('input', calcular);

        modeBruto.addEventListener('click', () => {
            modo = 'bruto';
            modeBruto.className = 'btn btn-primary';
            modeNeto.className = 'btn btn-secondary';
            document.getElementById('calc-input-label').textContent = 'Monto Bruto en USD';
            calcular();
        });

        modeNeto.addEventListener('click', () => {
            modo = 'neto';
            modeNeto.className = 'btn btn-primary';
            modeBruto.className = 'btn btn-secondary';
            document.getElementById('calc-input-label').textContent = 'Monto Neto en USD';
            calcular();
        });

        calcular();
    }
};