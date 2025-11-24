// En un caso real, estas credenciales vendrían de una base de datos segura
// y la verificación se haría en el servidor
const authorizedUsers = [
    { username: "1128906520", password: "J1128906520" },
    { username: "carlos", password: "10034310." },
    { username: "paola", password: "P1087984678" }
];

let loginAttempts = 3;
let isLoggedIn = false;

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (isLoggedIn) return;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Deshabilitar el botón durante la verificación
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando...";

    // Simular tiempo de verificación (en un caso real, sería una petición al servidor)
    setTimeout(() => {
        // Verificar credenciales
        const isValidUser = authorizedUsers.some(user =>
            user.username === username && user.password === password
        );

        if (isValidUser) {
            // Login exitoso - REDIRIGIR AL PANEL ADMIN
            window.location.href = "admin.html"; // ← RUTA CORREGIDA
        } else {
            // Login fallido
            loginAttempts--;
            document.getElementById('attemptsLeft').textContent = loginAttempts;

            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = "Verificar Identidad";

            if (loginAttempts <= 0) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Acceso Bloqueado";
                errorMessage.textContent = "Demasiados intentos fallidos. Acceso bloqueado temporalmente.";
            }
        }
    }, 1500); // Simular tiempo de respuesta del servidor
});