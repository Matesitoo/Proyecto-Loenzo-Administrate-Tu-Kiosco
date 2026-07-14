// utils.js - Funciones utilitarias compartidas

// Toast notifications
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Validar que los campos sean números positivos
function validarNumeroPositivo(valor, campo) {
    const num = parseFloat(valor);
    if (isNaN(num) || num < 0) {
        mostrarToast(campo + ' debe ser un numero positivo', 'error');
        return false;
    }
    return true;
}

// Formatear moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(valor);
}

// Generar ID unico
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Obtener usuario actual
function getUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuarioActual') || 'null');
}

// Verificar si es admin
function esAdmin() {
    const usuario = getUsuarioActual();
    return usuario && usuario.rol === 'admin';
}

// Cerrar sesion
function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('nombreUsuario');
    window.location.href = 'login.html';
}

// Hash de contrasenia (simulacion)
function hashPassword(password) {
    return btoa(password);
}