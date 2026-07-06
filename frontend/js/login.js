// Credenciales fijas de acceso
const USUARIO_CORRECTO = "mateo";
const CONTRASENIA_CORRECTA = "1234";

function validarLogin(event) {
    // Es para que la página no se recargue al enviar el formulario
    event.preventDefault();

    const usuarioIngresado = document.getElementById("usuario").value.trim();
    const contraseniaIngresada = document.getElementById("contrasenia").value;
    const mensajeError = document.getElementById("mensajeError");

    // Validamos
    if (usuarioIngresado === USUARIO_CORRECTO && contraseniaIngresada === CONTRASENIA_CORRECTA) {
        // Guardamos en localStorage que el usuario inició sesión
        localStorage.setItem("sesionActiva", "true");
        localStorage.setItem("nombreUsuario", usuarioIngresado);

        // Redireccionamos al index (Dashboard)
        window.location.href = "index.html";
    } else {
        // Mostramos el error si los datos son incorrectos
        mensajeError.innerText = "Usuario o contraseña incorrectos.";
        mensajeError.style.display = "block";
    }
}

// Si el usuario ya está logueado y entra a login.html, lo mandamos al index directo
if (localStorage.getItem("sesionActiva") === "true") {
    window.location.href = "index.html";
}