// dashboard.js - Vista principal del Dashboard
export const Dashboard = {
    title: '📊 Dashboard',

    render: (user = null) => {
        const nombre = user?.nombre || 'Usuario';
        return `
            <div style="padding:20px;">
                <h1 style="font-size:24px;margin-bottom:20px;">Bienvenido, ${nombre}!</h1>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
                    <div class="card" style="padding:20px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border-color);">
                        <div style="font-size:28px;font-weight:bold;color:var(--accent);">0</div>
                        <div style="color:var(--text-secondary);">Transacciones hoy</div>
                    </div>
                    <div class="card" style="padding:20px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border-color);">
                        <div style="font-size:28px;font-weight:bold;color:var(--accent);">0</div>
                        <div style="color:var(--text-secondary);">Pendientes</div>
                    </div>
                    <div class="card" style="padding:20px;border-radius:8px;background:var(--card-bg);border:1px solid var(--border-color);">
                        <div style="font-size:28px;font-weight:bold;color:var(--accent);">$0.00</div>
                        <div style="color:var(--text-secondary);">Total procesado</div>
                    </div>
                </div>
                <p style="margin-top:30px;color:var(--text-secondary);">Selecciona una opción en el menú inferior.</p>
            </div>
        `;
    },

    init: (user) => {
        console.log('Dashboard inicializado', user);
    }
};