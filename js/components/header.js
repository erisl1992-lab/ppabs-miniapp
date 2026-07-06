// header.js - Header de la aplicación
export const Header = {
    render: (title) => {
        const header = document.getElementById('app-header');
        if (!header) return;

        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const name = user?.first_name || 'Usuario';

        header.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <h1 style="font-size:18px;font-weight:700;color:var(--accent);">
                    ${title}
                </h1>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:12px;color:var(--text-muted);">👤 ${name}</span>
                    <button id="btn-close-app" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button>
                </div>
            </div>
        `;

        // Cerrar app
        document.getElementById('btn-close-app')?.addEventListener('click', () => {
            document.dispatchEvent(new Event('close-app'));
        });
    }
};