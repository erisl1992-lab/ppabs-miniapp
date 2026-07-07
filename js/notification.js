// notification.js - Notificaciones con sonidos integrados
import { Toast } from './components/toast.js';

// Precarga del sonido
let audioContext = null;

export const Notification = {
    /**
     * Reproduce un sonido según el tipo de evento
     * @param {string} type - 'kyc_approved' | 'new_transaction' | 'status_change'
     */
    playSound: (type) => {
        try {
            // Usar AudioContext para mejor compatibilidad móvil
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Cargar el archivo de sonido (debe estar en assets/notification.mp3)
            const soundUrl = 'assets/notification.mp3';

            // Usar fetch para obtener el archivo y decodificarlo
            fetch(soundUrl)
                .then(response => {
                    if (!response.ok) throw new Error('Sonido no encontrado');
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);

                    // Ajustar volumen según tipo (opcional)
                    const gainNode = audioContext.createGain();
                    gainNode.gain.value = 0.7; // Volumen al 70%
                    source.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    source.start();
                })
                .catch(err => {
                    console.warn('Error al reproducir sonido:', err);
                    // Fallback: intentar con Audio simple
                    const audio = new Audio(soundUrl);
                    audio.volume = 0.5;
                    audio.play().catch(() => {});
                });
        } catch (e) {
            // Silenciar errores de audio para no romper la experiencia
            console.debug('Audio no soportado o bloqueado');
        }
    },

    /**
     * Muestra una notificación toast con sonido opcional
     */
    show: (message, type = 'info', duration = 4000, soundType = null) => {
        // Mostrar el toast
        Toast.show(message, type, duration);

        // Reproducir sonido si se especifica
        if (soundType) {
            Notification.playSound(soundType);
        }
    },

    // ===== MÉTODOS ESPECÍFICOS =====

    /**
     * Notificación de éxito (sin sonido por defecto)
     */
    success: (message, sound = null) => Notification.show(message, 'success', 4000, sound),

    /**
     * Notificación de error (sin sonido)
     */
    error: (message) => Notification.show(message, 'error', 5000),

    /**
     * Notificación de advertencia
     */
    warning: (message) => Notification.show(message, 'warning', 4000),

    /**
     * Notificación informativa
     */
    info: (message) => Notification.show(message, 'info', 3000),

    // ===== EVENTOS ESPECIALES CON SONIDO =====

    /**
     * KYC aprobado: sonido + mensaje
     */
    kycApproved: (message = '✅ KYC aprobado exitosamente') => {
        Notification.show(message, 'success', 5000, 'kyc_approved');
    },

    /**
     * Nueva transacción: sonido + mensaje
     */
    newTransaction: (message = '💰 Nueva transacción registrada') => {
        Notification.show(message, 'info', 5000, 'new_transaction');
    },

    /**
     * Cambio de estado de transacción: sonido + mensaje
     */
    statusChanged: (message = '🔄 Estado de transacción actualizado') => {
        Notification.show(message, 'info', 4000, 'status_change');
    }
};