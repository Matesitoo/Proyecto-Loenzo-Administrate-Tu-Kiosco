// login.js - Sistema de autenticacion

console.log('login.js cargado correctamente');

var USUARIOS = [
    {
        id: '1',
        nombre_usuario: 'admin',
        contrasenia: hashPassword('admin123'),
        nombre_completo: 'Administrador',
        rol: 'admin'
    },
    {
        id: '2',
        nombre_usuario: 'vendedor',
        contrasenia: hashPassword('vendedor123'),
        nombre_completo: 'Vendedor Principal',
        rol: 'vendedor'
    }
];

function cargarUsuarios() {
    try {
        var usuariosGuardados = localStorage.getItem('usuarios');
        if (usuariosGuardados) {
            var parsed = JSON.parse(usuariosGuardados);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn('Error al cargar usuarios:', error.message);
        localStorage.removeItem('usuarios');
    }
    
    localStorage.setItem('usuarios', JSON.stringify(USUARIOS));
    return USUARIOS;
}

function validarLogin(event) {
    event.preventDefault();

    var usuarioInput = document.getElementById('usuario');
    var contraseniaInput = document.getElementById('contrasenia');
    var mensajeError = document.getElementById('mensajeError');

    var usuarioIngresado = usuarioInput.value.trim();
    var contraseniaIngresada = contraseniaInput.value;

    if (!usuarioIngresado || !contraseniaIngresada) {
        mensajeError.innerText = 'Complete todos los campos.';
        mensajeError.style.display = 'block';
        return;
    }

    var usuarios = cargarUsuarios();
    var usuario = null;
    
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].nombre_usuario === usuarioIngresado) {
            usuario = usuarios[i];
            break;
        }
    }
    
    if (!usuario) {
        mensajeError.innerText = 'Usuario o contrasenia incorrectos.';
        mensajeError.style.display = 'block';
        return;
    }

    if (usuario.contrasenia === hashPassword(contraseniaIngresada)) {
        localStorage.setItem('sesionActiva', 'true');
        localStorage.setItem('nombreUsuario', usuario.nombre_completo);
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        window.location.href = 'index.html';
    } else {
        mensajeError.innerText = 'Usuario o contrasenia incorrectos.';
        mensajeError.style.display = 'block';
    }
}

// Si el usuario ya esta logueado
if (localStorage.getItem('sesionActiva') === 'true') {
    window.location.href = 'index.html';
}