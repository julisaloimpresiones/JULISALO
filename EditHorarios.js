// Cargar horarios al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadHorariosFromFirebase();
    setupCheckboxListeners();
});

// Configurar listeners para checkboxes
function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.closed-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const day = this.id.replace('Cerrado', '');
            const input = document.getElementById(day + 'Horario');
            
            if (this.checked) {
                input.value = 'Cerrado';
                input.disabled = true;
            } else {
                input.disabled = false;
                // Restaurar valor por defecto si estaba vacío
                if (!input.value || input.value === 'Cerrado') {
                    const defaultValues = {
                        'lunes': '9:00 AM - 8:00 PM',
                        'martes': '9:00 AM - 8:00 PM',
                        'miercoles': '9:00 AM - 8:00 PM',
                        'jueves': '9:00 AM - 8:00 PM',
                        'viernes': '9:00 AM - 9:00 PM',
                        'sabado': '10:00 AM - 6:00 PM',
                        'domingo': 'Cerrado'
                    };
                    input.value = defaultValues[day] || '';
                }
            }
        });
    });
}

// CARGAR horarios desde Firebase
async function loadHorariosFromFirebase() {
    try {
        const db = window.firebaseDB;
        const { doc, getDoc } = window.firebaseFunctions;
        
        const horariosDoc = await getDoc(doc(db, "horarios", "semana"));
        
        if (horariosDoc.exists()) {
            const horariosData = horariosDoc.data();
            
            // Cargar horarios de cada día
            document.getElementById('lunesHorario').value = horariosData.lunes || '9:00 AM - 8:00 PM';
            document.getElementById('martesHorario').value = horariosData.martes || '9:00 AM - 8:00 PM';
            document.getElementById('miercolesHorario').value = horariosData.miercoles || '9:00 AM - 8:00 PM';
            document.getElementById('juevesHorario').value = horariosData.jueves || '9:00 AM - 8:00 PM';
            document.getElementById('viernesHorario').value = horariosData.viernes || '9:00 AM - 9:00 PM';
            document.getElementById('sabadoHorario').value = horariosData.sabado || '10:00 AM - 6:00 PM';
            document.getElementById('domingoHorario').value = horariosData.domingo || 'Cerrado';
            
            // Cargar checkboxes de "Cerrado"
            document.getElementById('lunesCerrado').checked = horariosData.lunes === 'Cerrado';
            document.getElementById('martesCerrado').checked = horariosData.martes === 'Cerrado';
            document.getElementById('miercolesCerrado').checked = horariosData.miercoles === 'Cerrado';
            document.getElementById('juevesCerrado').checked = horariosData.jueves === 'Cerrado';
            document.getElementById('viernesCerrado').checked = horariosData.viernes === 'Cerrado';
            document.getElementById('sabadoCerrado').checked = horariosData.sabado === 'Cerrado';
            document.getElementById('domingoCerrado').checked = horariosData.domingo === 'Cerrado';
            
            // Actualizar estados de inputs
            updateInputStates();
            
            // Cargar notas
            document.getElementById('notasHorarios').value = horariosData.notas || 'Horario extendido los viernes hasta las 9:00 PM. Cerramos los domingos para descanso del personal.';
        }
        
    } catch (error) {
        console.error("Error cargando horarios:", error);
        alert("Error al cargar horarios");
    }
}

// Actualizar estados de inputs basado en checkboxes
function updateInputStates() {
    const checkboxes = document.querySelectorAll('.closed-checkbox');
    checkboxes.forEach(checkbox => {
        const day = checkbox.id.replace('Cerrado', '');
        const input = document.getElementById(day + 'Horario');
        
        if (checkbox.checked) {
            input.disabled = true;
            input.value = 'Cerrado';
        }
    });
}

// GUARDAR horarios en Firebase
async function saveHorarios() {
    try {
        const db = window.firebaseDB;
        const { doc, setDoc } = window.firebaseFunctions;
        
        const horariosData = {
            lunes: document.getElementById('lunesCerrado').checked ? 'Cerrado' : document.getElementById('lunesHorario').value,
            martes: document.getElementById('martesCerrado').checked ? 'Cerrado' : document.getElementById('martesHorario').value,
            miercoles: document.getElementById('miercolesCerrado').checked ? 'Cerrado' : document.getElementById('miercolesHorario').value,
            jueves: document.getElementById('juevesCerrado').checked ? 'Cerrado' : document.getElementById('juevesHorario').value,
            viernes: document.getElementById('viernesCerrado').checked ? 'Cerrado' : document.getElementById('viernesHorario').value,
            sabado: document.getElementById('sabadoCerrado').checked ? 'Cerrado' : document.getElementById('sabadoHorario').value,
            domingo: document.getElementById('domingoCerrado').checked ? 'Cerrado' : document.getElementById('domingoHorario').value,
            notas: document.getElementById('notasHorarios').value,
            fechaActualizacion: new Date()
        };
        
        await setDoc(doc(db, "horarios", "semana"), horariosData);
        
        showNotification('¡Horarios guardados exitosamente en Firebase!');
        
    } catch (error) {
        console.error("Error guardando horarios:", error);
        alert("Error al guardar horarios");
    }
}

// Cancelar cambios
function cancelChanges() {
    if (confirm('¿Estás seguro de que quieres descartar los cambios?')) {
        loadHorariosFromFirebase();
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
        saveHorarios();
    }
});