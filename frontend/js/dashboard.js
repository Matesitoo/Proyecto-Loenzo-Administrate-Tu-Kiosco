// dashboard.js - Panel de control

var productos = JSON.parse(localStorage.getItem('productos')) || [];
var ventas = JSON.parse(localStorage.getItem('ventas')) || [];

document.addEventListener('DOMContentLoaded', function() {
    actualizarDashboard();
    mostrarUltimasVentas();
    mostrarNombreUsuario();
    agregarBotonModoOscuro();
});

function actualizarDashboard() {
    document.getElementById('cantProductos').innerText = productos.length;
    document.getElementById('cantVentas').innerText = ventas.length;
    
    var ingresos = 0;
    for (var i = 0; i < ventas.length; i++) {
        ingresos += ventas[i].total;
    }
    document.getElementById('ingresos').innerText = formatearMoneda(ingresos);
    
    var stockBajo = 0;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].stock <= (productos[i].stock_minimo || 5)) {
            stockBajo++;
        }
    }
    document.getElementById('stockBajo').innerText = stockBajo;
}

function mostrarUltimasVentas() {
    var lista = document.getElementById('ultimasVentas');
    
    if (ventas.length === 0) {
        lista.innerHTML = '<li>No hay ventas registradas</li>';
        return;
    }
    
    lista.innerHTML = '';
    var ultimas = ventas.slice().reverse().slice(0, 5);
    for (var i = 0; i < ultimas.length; i++) {
        var venta = ultimas[i];
        var usuario = venta.usuario ? ' - Vendedor: ' + venta.usuario : '';
        lista.innerHTML += '<li><strong>' + venta.fecha + '</strong> - Total: ' + formatearMoneda(venta.total) + usuario + '</li>';
    }
}

function mostrarNombreUsuario() {
    var usuario = getUsuarioActual();
    if (usuario) {
        document.getElementById('nombreUsuario').innerText = usuario.nombre_completo + ' (' + usuario.rol + ')';
    }
}

function agregarBotonModoOscuro() {
    var sidebar = document.querySelector('.sidebar');
    var boton = document.createElement('a');
    boton.href = '#';
    boton.innerText = 'Modo Oscuro';
    boton.style.marginTop = '20px';
    boton.onclick = function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        boton.innerText = document.body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Oscuro';
    };
    sidebar.appendChild(boton);
}