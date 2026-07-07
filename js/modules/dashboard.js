// dashboard.js - Dashboard completo con estadísticas y gráficos
import { API } from '../api.js';
import { Storage } from '../storage.js';
import { Utils } from '../utils.js';
import { Notification } from '../notification.js';

// Cargar Chart.js desde CDN (solo si no está cargado)
function loadChartJS() {
    return new Promise((resolve, reject) => {
        if (window.Chart) {
            resolve(window.Chart);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => resolve(window.Chart);
        script.onerror = () => reject(new Error('Error al cargar Chart.js'));
        document.head.appendChild(script);
    });
}

export const Dashboard = {
    title: '📊 Inicio',
    _chartInstance: null,

    render: () => {
        return `
            <div id="dashboard-container" style="padding:16px;">
                <h2 style="font-size:20px;font-weight:bold;margin-bottom:16px;">📊 Resumen</h2>

                <!-- Tarjetas de estadísticas -->
                <div id="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px;">
                    <div class="stat-card" style="background:var(--card-bg);padding:16px;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                        <div style="font-size:11px;color:var(--text-secondary);">Hoy</div>
                        <div id="stat-today" style="font-size:24px;font-weight:bold;color:var(--accent);">0</div>
                    </div>
                    <div class="stat-card" style="background:var(--card-bg);padding:16px;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                        <div style="font-size:11px;color:var(--text-secondary);">Pendientes</div>
                        <div id="stat-pending" style="font-size:24px;font-weight:bold;color:var(--warning);">0</div>
                    </div>
                    <div class="stat-card" style="background:var(--card-bg);padding:16px;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                        <div style="font-size:11px;color:var(--text-secondary);">Completadas</div>
                        <div id="stat-completed" style="font-size:24px;font-weight:bold;color:var(--success);">0</div>
                    </div>
                    <div class="stat-card" style="background:var(--card-bg);padding:16px;border-radius:8px;border:1px solid var(--border-color);text-align:center;">
                        <div style="font-size:11px;color:var(--text-secondary);">Total USD</div>
                        <div id="stat-total" style="font-size:24px;font-weight:bold;color:var(--accent);">$0.00</div>
                    </div>
                </div>

                <!-- Gráfico -->
                <div style="background:var(--card-bg);padding:16px;border-radius:8px;border:1px solid var(--border-color);margin-bottom:20px;">
                    <h3 style="font-size:14px;font-weight:bold;margin-bottom:12px;">📈 Transacciones por día (última semana)</h3>
                    <div style="position:relative;height:200px;">
                        <canvas id="dashboard-chart"></canvas>
                    </div>
                </div>

                <!-- Últimas transacciones -->
                <div style="background:var(--card-bg);padding:16px;border-radius:8px;border:1px solid var(--border-color);">
                    <h3 style="font-size:14px;font-weight:bold;margin-bottom:12px;">🕒 Últimas transacciones</h3>
                    <div id="recent-transactions">
                        <p style="color:var(--text-secondary);font-size:13px;">Cargando...</p>
                    </div>
                </div>
            </div>
        `;
    },

    init: async (user) => {
        console.log('Dashboard inicializado', user);

        // Cargar datos
        await Dashboard._loadStats(user);

        // Cargar gráfico (esperar a que Chart.js esté disponible)
        try {
            await loadChartJS();
            await Dashboard._loadChart();
        } catch (err) {
            console.warn('No se pudo cargar el gráfico:', err);
        }

        // Recargar cada 30 segundos (opcional)
        if (Dashboard._interval) clearInterval(Dashboard._interval);
        Dashboard._interval = setInterval(() => {
            Dashboard._loadStats(user);
        }, 30000);
    },

    _loadStats: async (user) => {
        try {
            // Obtener transacciones del usuario (o todas si es admin)
            const userId = user?.id || Storage.get('user')?.id;
            if (!userId) {
                console.warn('Sin ID de usuario');
                return;
            }

            // Intentar obtener transacciones del usuario
            const data = await API.transactions.list({ user_id: userId });
            const txs = data.transactions || [];

            // Calcular estadísticas
            const today = new Date().toDateString();
            const todayTxs = txs.filter(t => new Date(t.fecha_creacion).toDateString() === today);
            const pending = txs.filter(t => t.status === 'PAGADO' || t.status === 'VALIDANDO' || t.status === 'EN_PROCESO');
            const completed = txs.filter(t => t.status === 'COMPLETADO');
            const total = txs.reduce((sum, t) => sum + parseFloat(t.amount_usd || 0), 0);

            // Actualizar DOM
            document.getElementById('stat-today').textContent = todayTxs.length;
            document.getElementById('stat-pending').textContent = pending.length;
            document.getElementById('stat-completed').textContent = completed.length;
            document.getElementById('stat-total').textContent = `$${total.toFixed(2)}`;

            // Mostrar últimas transacciones
            const recentContainer = document.getElementById('recent-transactions');
            const sorted = txs.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
            const recent = sorted.slice(0, 5);

            if (recent.length === 0) {
                recentContainer.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;">No hay transacciones recientes.</p>';
                return;
            }

            recentContainer.innerHTML = recent.map(tx => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);">
                    <div>
                        <div style="font-size:13px;font-weight:600;">${Utils.truncate(tx.transaction_id, 12)}</div>
                        <div style="font-size:11px;color:var(--text-secondary);">${Utils.formatDate(tx.fecha_creacion)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:14px;font-weight:bold;">$${parseFloat(tx.amount_usd).toFixed(2)}</div>
                        <span class="status-badge ${Utils.getStatusClass(tx.status)}" style="font-size:10px;padding:2px 8px;border-radius:12px;">
                            ${Utils.getStatusEmoji(tx.status)} ${tx.status}
                        </span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            // Si es 401, redirigir a login o mostrar mensaje
            if (error.message.includes('401') || error.message.includes('token')) {
                document.getElementById('recent-transactions').innerHTML =
                    '<p style="color:var(--danger);font-size:13px;">⚠️ Sesión expirada. Inicia sesión nuevamente.</p>';
            } else {
                document.getElementById('recent-transactions').innerHTML =
                    '<p style="color:var(--danger);font-size:13px;">❌ Error al cargar datos.</p>';
            }
        }
    },

    _loadChart: async () => {
        try {
            // Obtener transacciones de los últimos 7 días
            const userId = Storage.get('user')?.id;
            if (!userId) return;

            const data = await API.transactions.list({ user_id: userId });
            const txs = data.transactions || [];

            // Agrupar por día
            const days = [];
            const counts = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayLabel = d.toLocaleDateString('es-VE', { weekday: 'short', day: 'numeric' });
                const count = txs.filter(t => t.fecha_creacion && t.fecha_creacion.startsWith(dateStr)).length;
                days.push(dayLabel);
                counts.push(count);
            }

            const ctx = document.getElementById('dashboard-chart')?.getContext('2d');
            if (!ctx) return;

            // Destruir gráfico anterior si existe
            if (Dashboard._chartInstance) {
                Dashboard._chartInstance.destroy();
            }

            Dashboard._chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Transacciones',
                        data: counts,
                        backgroundColor: 'rgba(0, 112, 186, 0.6)',
                        borderColor: '#0070ba',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });

        } catch (error) {
            console.warn('Error al cargar gráfico:', error);
        }
    }
};