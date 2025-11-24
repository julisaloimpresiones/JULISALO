     // Funciones para modales
     function openModal(type) {
        document.getElementById(type + 'Modal').style.display = 'flex';
    }
    
    function closeModal(type) {
        document.getElementById(type + 'Modal').style.display = 'none';
    }
    
    function saveChanges(type) {
        alert('Cambios guardados exitosamente en ' + type);
        closeModal(type);
    }
    
    function logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            window.location.href = 'index.html';
        }
    }
    
    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }