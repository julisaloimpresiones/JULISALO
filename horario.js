// Resaltar el día actual
const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const today = new Date().getDay();
const todayElement = document.getElementById(days[today]);

if (todayElement) {
    todayElement.classList.add('today');
}

// Actualizar estado actual (abierto/cerrado)
function updateCurrentStatus() {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const statusElement = document.getElementById('currentStatus');
    const timeElement = document.getElementById('currentTime');
    
    // Horarios por día (ejemplo)
    const schedules = {
        0: { open: null, close: null, text: "Cerrado" }, // Domingo
        1: { open: 9, close: 20, text: "9:00 AM - 8:00 PM" }, // Lunes
        2: { open: 9, close: 20, text: "9:00 AM - 8:00 PM" }, // Martes
        3: { open: 9, close: 20, text: "9:00 AM - 8:00 PM" }, // Miércoles
        4: { open: 9, close: 20, text: "9:00 AM - 8:00 PM" }, // Jueves
        5: { open: 9, close: 21, text: "9:00 AM - 9:00 PM" }, // Viernes
        6: { open: 10, close: 18, text: "10:00 AM - 6:00 PM" }  // Sábado
    };
    
    const todaySchedule = schedules[currentDay];
    
    if (todaySchedule.open === null) {
        statusElement.textContent = "Cerrado hoy";
        statusElement.style.color = "#dc3545";
    } else {
        const currentTime = currentHour + (currentMinutes / 60);
        const isOpen = currentTime >= todaySchedule.open && currentTime < todaySchedule.close;
        
        if (isOpen) {
            statusElement.textContent = "Abierto ahora";
            statusElement.style.color = "#28a745";
        } else {
            statusElement.textContent = "Cerrado ahora";
            statusElement.style.color = "#dc3545";
        }
    }
    
    timeElement.textContent = `Horario de hoy: ${todaySchedule.text}`;
}

// Actualizar al cargar la página
updateCurrentStatus();