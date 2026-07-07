// kyc.js - Registro y gestión KYC (versión unificada)
import { API } from '../api.js';
import { Telegram } from '../telegram.js';
import { Notification } from '../notification.js';  // 
import { Utils } from '../utils.js';
import { Loading } from '../components/loading.js';

export const KYC = {
    title: '📋 Verificación KYC',
    _currentStatus: null,

    /**
     * Renderiza la vista KYC
     */
    render: () => {
        return `
            <div id="kyc-section" style="padding:20px;">
                <h2 style="font-size:20px;font-weight:bold;margin-bottom:8px;">📋 Verificación de Identidad (KYC)</h2>
                <p style="color:var(--text-secondary);font-size:14px;margin-bottom:20px;">
                    Completa tus datos para poder realizar transacciones.
                </p>

                <div id="kyc-status-banner" class="kyc-status-banner review" style="
                    padding:12px 16px;
                    border-radius:8px;
                    margin-bottom:16px;
                    font-weight:600;
                    background:var(--warning-bg);
                    color:var(--warning-text);
                    border:1px solid var(--warning-border);
                ">
                    ⏳ Verificando tu estado...
                </div>

                <form id="kyc-form" class="kyc-form" style="display:block;">
                    <div class="form-group" style="margin-bottom:12px;">
                        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;">
                            Nombre completo <span style="color:var(--danger);">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="kyc-nombre" 
                            class="input-field" 
                            placeholder="Ej: Juan Pérez" 
                            required 
                            style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:6px;"
                        />
                    </div>

                    <div class="form-group" style="margin-bottom:12px;">
                        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;">
                            Cédula / Pasaporte <span style="color:var(--danger);">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="kyc-cedula" 
                            class="input-field" 
                            placeholder="Ej: 12345678" 
                            required 
                            style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:6px;"
                        />
                    </div>

                    <div class="form-group" style="margin-bottom:12px;">
                        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;">
                            Banco
                        </label>
                        <input 
                            type="text" 
                            id="kyc-banco" 
                            class="input-field" 
                            placeholder="Ej: Banco del Este" 
                            style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:6px;"
                        />
                    </div>

                    <div class="form-group" style="margin-bottom:12px;">
                        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;">
                            Número de cuenta
                        </label>
                        <input 
                            type="text" 
                            id="kyc-cuenta" 
                            class="input-field" 
                            placeholder="Ej: 1234567890" 
                            style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:6px;"
                        />
                    </div>

                    <div class="form-group" style="margin-bottom:16px;">
                        <label style="display:block;font-weight:600;margin-bottom:4px;font-size:14px;">
                            Teléfono <span style="color:var(--danger);">*</span>
                        </label>
                        <input 
                            type="tel" 
                            id="kyc-telefono" 
                            class="input-field" 
                            placeholder="Ej: +584121234567" 
                            required 
                            style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:6px;"
                        />
                        <span style="font-size:12px;color:var(--text-secondary);">
                            Incluye código de país
                        </span>
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary" 
                        style="width:100%;padding:12px;background:var(--accent);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;"
                    >
                        📤 Enviar KYC
                    </button>
                </form>

                <!-- Información adicional -->
                <div style="margin-top:20px;padding:12px 16px;background:var(--card-bg);border-radius:8px;border:1px solid var(--border-color);">
                    <p style="font-size:12px;color:var(--text-secondary);margin:0;">
                        🔒 Tus datos están seguros y solo serán usados para verificar tu identidad.
                        El proceso de verificación puede tomar hasta 24 horas.
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa el módulo KYC
     */
    init: async () => {
        const userId = Telegram.getUserId();
        if (!userId) {
            const banner = document.getElementById('kyc-status-banner');
            if (banner) {
                banner.textContent = '❌ No se pudo obtener tu ID de Telegram. Asegúrate de abrir la app desde Telegram.';
                banner.className = 'kyc-status-banner error';
            }
            return;
        }

        // Cargar estado actual del KYC
        await KYC._loadStatus(userId);

        // Evento de envío del formulario
        const form = document.getElementById('kyc-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await KYC._submitForm(userId);
            });
        }
    },

    /**
     * Carga el estado actual del KYC desde el backend
     */
    _loadStatus: async (userId) => {
        try {
            const data = await API.kyc.get(userId);
            KYC._currentStatus = data.status;

            const banner = document.getElementById('kyc-status-banner');
            const form = document.getElementById('kyc-form');

            if (!banner) return;

            // Mapeo de estados unificados
            const statusMap = {
                'COMPLETADO': { 
                    class: 'approved', 
                    text: '✅ KYC aprobado. ¡Ya puedes realizar transacciones!', 
                    hideForm: true 
                },
                'APROBADO': { 
                    class: 'approved', 
                    text: '✅ KYC aprobado. ¡Ya puedes realizar transacciones!', 
                    hideForm: true 
                },
                'CANCELADO': { 
                    class: 'rejected', 
                    text: '❌ KYC rechazado. Contacta al administrador para más información.', 
                    hideForm: true 
                },
                'RECHAZADO': { 
                    class: 'rejected', 
                    text: '❌ KYC rechazado. Contacta al administrador para más información.', 
                    hideForm: true 
                },
                'VALIDANDO': { 
                    class: 'review', 
                    text: '⏳ Tu KYC está en revisión. El proceso puede tardar hasta 24 horas.', 
                    hideForm: true 
                },
                'EN_REVISIÓN': { 
                    class: 'review', 
                    text: '⏳ Tu KYC está en revisión. El proceso puede tardar hasta 24 horas.', 
                    hideForm: true 
                },
                'EN_PROCESO': { 
                    class: 'review', 
                    text: '🔄 Tu KYC está siendo verificado. Pronto recibirás una respuesta.', 
                    hideForm: true 
                },
                'PROCESO_MANUAL': { 
                    class: 'manual', 
                    text: '🟡 Tu KYC requiere revisión manual. Te contactaremos pronto.', 
                    hideForm: true 
                }
            };

            const statusInfo = statusMap[data.status] || statusMap['VALIDANDO'];

            banner.className = `kyc-status-banner ${statusInfo.class}`;
            banner.textContent = statusInfo.text;

            if (form) {
                form.style.display = statusInfo.hideForm ? 'none' : 'block';
            }

            // Si está completado, guardar en Storage para que el Router lo sepa
            if (data.status === 'COMPLETADO' || data.status === 'APROBADO') {
                const user = {
                    id: userId,
                    nombre: data.nombre || 'Usuario',
                    kycStatus: 'APROBADO'
                };
                Storage.set('user', user);
            }

        } catch (error) {
            // No encontrado (404) o error de red -> mostrar formulario
            const banner = document.getElementById('kyc-status-banner');
            const form = document.getElementById('kyc-form');

            if (banner) {
                banner.className = 'kyc-status-banner review';
                banner.textContent = '📝 No estás registrado. Completa el formulario para iniciar tu verificación KYC.';
            }
            if (form) {
                form.style.display = 'block';
            }

            // Resetear estado
            KYC._currentStatus = null;
        }
    },

    /**
     * Envía el formulario KYC al backend
     */
    _submitForm: async (userId) => {
        // Obtener datos del formulario
        const nombre = document.getElementById('kyc-nombre').value.trim();
        const cedula = document.getElementById('kyc-cedula').value.trim();
        const banco = document.getElementById('kyc-banco').value.trim();
        const cuenta = document.getElementById('kyc-cuenta').value.trim();
        const telefono = document.getElementById('kyc-telefono').value.trim();

        // Validaciones
        if (!nombre || nombre.length < 3) {
            Notification.error('Ingresa un nombre completo válido (mínimo 3 caracteres).');
            return;
        }

        if (!cedula || cedula.length < 5) {
            Notification.error('Ingresa un número de cédula/pasaporte válido.');
            return;
        }

        if (!telefono || telefono.length < 10) {
            Notification.error('Ingresa un número de teléfono válido (incluye código de país).');
            return;
        }

        // Validar formato del teléfono (opcional, mejora)
        const telefonoRegex = /^\+?[0-9]{10,15}$/;
        if (!telefonoRegex.test(telefono.replace(/\s/g, ''))) {
            Notification.error('El teléfono debe tener formato internacional (ej: +584121234567).');
            return;
        }

        const payload = {
            telegram_id: userId,
            nombre,
            cedula,
            banco: banco || 'N/A',
            cuenta: cuenta || 'N/A',
            telefono
        };

        Loading.show('Enviando datos KYC...');

        try {
            const result = await API.kyc.register(payload);
            Notification.success('✅ KYC enviado correctamente. Espera la verificación del administrador.');

            // Recargar estado para mostrar el mensaje de "en revisión"
            await KYC._loadStatus(userId);

            // Disparar evento para que el Router actualice el menú si es necesario
            document.dispatchEvent(new CustomEvent('kyc-updated', {
                detail: { status: 'VALIDANDO' }
            }));

        } catch (error) {
            let message = error.message || 'Error al enviar KYC. Intenta nuevamente.';

            // Manejar errores específicos
            if (error.response?.status === 409) {
                message = '⚠️ Ya tienes un KYC registrado. Espera la verificación.';
            } else if (error.response?.status === 400) {
                message = '⚠️ Datos incompletos o inválidos. Revisa el formulario.';
            }

            Notification.error(message);
        } finally {
            Loading.hide();
        }
    },

    /**
     * Obtiene el estado actual del KYC (para uso externo)
     */
    getStatus: () => {
        return KYC._currentStatus;
    },

    /**
     * Verifica si el usuario tiene KYC aprobado
     */
    isApproved: () => {
        return KYC._currentStatus === 'COMPLETADO' || KYC._currentStatus === 'APROBADO';
    }
};