// pdf.js - Generación de PDFs con html2pdf
export const PDF = {
    /**
     * Genera un PDF a partir de un elemento HTML
     */
    generate: (elementId, filename = 'recibo.pdf') => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error('Elemento no encontrado:', elementId);
            return Promise.reject('Elemento no encontrado');
        }

        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        return html2pdf().from(element).set(opt).save();
    },

    /**
     * Genera un recibo de transacción
     */
    generateReceipt: (transaction, userData) => {
        // Crear contenido HTML temporal
        const content = `
            <div style="font-family: Arial, sans-serif; padding: 30px;">
                <h1 style="color: #0070ba;">PPABS</h1>
                <hr>
                <p><strong>Transacción:</strong> ${transaction.transaction_id}</p>
                <p><strong>Usuario:</strong> ${userData?.nombre || transaction.user_id}</p>
                <p><strong>Monto:</strong> $${transaction.amount_usd} USD</p>
                <p><strong>Local:</strong> ${transaction.amount_local} Bs</p>
                <p><strong>Estado:</strong> ${transaction.status}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Comprobante generado automáticamente.</p>
            </div>
        `;

        // Crear un elemento temporal
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        document.body.appendChild(tempDiv);

        return PDF.generateFromElement(tempDiv, `recibo-${transaction.transaction_id}.pdf`)
            .finally(() => {
                document.body.removeChild(tempDiv);
            });
    }
};