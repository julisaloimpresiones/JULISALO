function copyEmail() {
    const email = 'milocal@gmail.com';
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(email)
        .then(() => {
            // Mostrar notificación
            const notification = document.createElement('div');
            notification.textContent = '¡Email copiado!';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4a6cf7;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 1000;
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        })
        .catch(err => {
            alert('Email: ' + email);
        });
}