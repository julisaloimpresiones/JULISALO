// Cargar contactos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadContactsFromFirebase();
});

// CARGAR contactos desde Firebase
async function loadContactsFromFirebase() {
    try {
        const db = window.firebaseDB;
        const { doc, getDoc } = window.firebaseFunctions;
        
        const contactDoc = await getDoc(doc(db, "contactos", "info"));
        
        if (contactDoc.exists()) {
            const contactData = contactDoc.data();
            document.getElementById('emailInput').value = contactData.email || '';
            document.getElementById('whatsappInput').value = contactData.whatsapp || '';
        } else {
            // Valores por defecto si no existen
            document.getElementById('emailInput').value = 'milocal@gmail.com';
            document.getElementById('whatsappInput').value = '+1 234 567 890';
        }
        
    } catch (error) {
        console.error("Error cargando contactos:", error);
        alert("Error al cargar contactos");
    }
}

// GUARDAR contactos en Firebase
async function saveContacts() {
    const email = document.getElementById('emailInput').value;
    const whatsapp = document.getElementById('whatsappInput').value;
    
    if (!email || !whatsapp) {
        alert('Por favor, completa ambos campos.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Por favor, ingresa un email válido.');
        return;
    }
    
    if (!isValidWhatsApp(whatsapp)) {
        alert('Por favor, ingresa un número de WhatsApp válido con código de país (ej: +573001234567).');
        return;
    }
    
    try {
        const db = window.firebaseDB;
        const { doc, setDoc } = window.firebaseFunctions;
        
        const contactData = {
            email: email,
            whatsapp: whatsapp,
            fechaActualizacion: new Date()
        };
        
        await setDoc(doc(db, "contactos", "info"), contactData);
        
        showNotification('¡Contactos guardados exitosamente en Firebase!');
        
    } catch (error) {
        console.error("Error guardando contactos:", error);
        alert("Error al guardar contactos");
    }
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar WhatsApp
function isValidWhatsApp(whatsapp) {
    const whatsappRegex = /^\+[1-9]\d{1,14}$/;
    return whatsappRegex.test(whatsapp);
}

// Probar enlace de email
function testEmail() {
    const email = document.getElementById('emailInput').value || 'milocal@gmail.com';
    window.location.href = `mailto:${email}`;
}

// Probar enlace de WhatsApp
function testWhatsApp() {
    const whatsapp = document.getElementById('whatsappInput').value || '+1234567890';
    const cleanNumber = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
}

// Cancelar cambios
function cancelChanges() {
    if (confirm('¿Estás seguro de que quieres descartar los cambios?')) {
        loadContactsFromFirebase();
    }
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Guardar con Ctrl+S
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveContacts();
    }
});