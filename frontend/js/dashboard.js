// dashboard.js - Panel de control

var productos = JSON.parse(localStorage.getItem('productos')) || [];
var ventas = JSON.parse(localStorage.getItem('ventas')) || [];

document.addEventListener('DOMContentLoaded', function() {
    actualizarDashboard();
    mostrarUltimasVentas();
    mostrarNombreUsuario();
    mostrarDetalleStockBajo();
    mostrarDetalleSinStock();
    mostrarInfoExtra();
});

function actualizarDashboard() {
    document.getElementById('cantProductos').innerText = productos.length;
    document.getElementById('cantVentas').innerText = ventas.length;
    
    var ingresos = 0;
    for (var i = 0; i < ventas.length; i++) {
        ingresos += ventas[i].total;
    }
    document.getElementById('ingresos').innerText = formatearMoneda(ingresos);
    
    // Stock bajo (1 a 5 unidades)
    var stockBajo = 0;
    var productosBajo = [];
    // Sin stock (0 unidades)
    var sinStock = 0;
    var productosSinStock = [];
    
    for (var i = 0; i < productos.length; i++) {
        var p = productos[i];
        if (p.stock === 0) {
            sinStock++;
            productosSinStock.push(p);
        } else if (p.stock <= (p.stock_minimo || 5)) {
            stockBajo++;
            productosBajo.push(p);
        }
    }
    
    // Actualizar tarjeta "Poco Stock"
    var stockElement = document.getElementById('stockBajo');
    var cardStock = document.getElementById('cardStockBajo');
    var alertaElement = document.getElementById('stockAlerta');
    
    stockElement.innerText = stockBajo;
    
    if (stockBajo > 0) {
        cardStock.className = 'card card-stock-bajo';
        alertaElement.innerText = stockBajo + ' producto(s) con poco stock';
        alertaElement.style.color = '#92400e';
    } else {
        cardStock.className = 'card';
        alertaElement.innerText = '✅ Todos con stock suficiente';
        alertaElement.style.color = '#16a34a';
    }
    
    // Actualizar tarjeta "Sin Stock"
    var sinStockElement = document.getElementById('sinStock');
    var cardSinStock = document.getElementById('cardSinStock');
    var sinStockAlerta = document.getElementById('sinStockAlerta');
    
    sinStockElement.innerText = sinStock;
    
    if (sinStock > 0) {
        cardSinStock.className = 'card card-sin-stock';
        sinStockAlerta.innerText = sinStock + ' producto(s) sin stock';
        sinStockAlerta.style.color = '#991b1b';
    } else {
        cardSinStock.className = 'card';
        sinStockAlerta.innerText = '✅ Todos los productos tienen stock';
        sinStockAlerta.style.color = '#16a34a';
    }
}

function mostrarDetalleStockBajo() {
    var container = document.getElementById('detalleStockBajo');
    var productosBajo = [];
    
    for (var i = 0; i < productos.length; i++) {
        var p = productos[i];
        if (p.stock > 0 && p.stock <= (p.stock_minimo || 5)) {
            productosBajo.push(p);
        }
    }
    
    if (productosBajo.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    var html = '<h3>⚠️ Productos con poco stock (1 a ' + (productos[0]?.stock_minimo || 5) + ' unidades)</h3><ul>';
    for (var i = 0; i < productosBajo.length; i++) {
        var p = productosBajo[i];
        html += '<li>';
        html += '<span class="nombre">' + p.nombre + '</span>';
        html += '<span class="stock">Stock: ' + p.stock + ' (minimo: ' + (p.stock_minimo || 5) + ')</span>';
        html += '</li>';
    }
    html += '</ul>';
    container.innerHTML = html;
}

function mostrarDetalleSinStock() {
    var container = document.getElementById('detalleSinStock');
    var productosSinStock = [];
    
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].stock === 0) {
            productosSinStock.push(productos[i]);
        }
    }
    
    if (productosSinStock.length === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    var html = '<h3>🚫 Productos sin stock</h3><ul>';
    for (var i = 0; i < productosSinStock.length; i++) {
        var p = productosSinStock[i];
        html += '<li>';
        html += '<span class="nombre">' + p.nombre + '</span>';
        html += '<span class="stock">Stock: 0</span>';
        html += '</li>';
    }
    html += '</ul>';
    container.innerHTML = html;
}

function mostrarInfoExtra() {
    // Producto mas vendido
    var productoMasVendido = '-';
    var maxCantidad = 0;
    var ventasProductos = {};
    
    for (var i = 0; i < ventas.length; i++) {
        var v = ventas[i];
        for (var j = 0; j < v.productos.length; j++) {
            var p = v.productos[j];
            if (ventasProductos[p.nombre]) {
                ventasProductos[p.nombre] += p.cantidad;
            } else {
                ventasProductos[p.nombre] = p.cantidad;
            }
        }
    }
    
    var nombres = Object.keys(ventasProductos);
    for (var i = 0; i < nombres.length; i++) {
        if (ventasProductos[nombres[i]] > maxCantidad) {
            maxCantidad = ventasProductos[nombres[i]];
            productoMasVendido = nombres[i] + ' (' + maxCantidad + ' u.)';
        }
    }
    
    document.getElementById('productoMasVendido').innerText = productoMasVendido;
    
    // Ventas de hoy
    var hoy = new Date();
    var dia = hoy.getDate();
    var mes = hoy.getMonth() + 1;
    var anio = hoy.getFullYear();
    
    var fechaHoy1 = dia + '/' + mes + '/' + anio;
    var fechaHoy2 = dia + '/' + ('0' + mes).slice(-2) + '/' + anio;
    
    var ventasHoy = 0;
    var montoHoy = 0;
    
    for (var i = 0; i < ventas.length; i++) {
        var fechaVenta = ventas[i].fecha.split(',')[0];
        if (fechaVenta === fechaHoy1 || fechaVenta === fechaHoy2) {
            ventasHoy++;
            montoHoy += ventas[i].total;
        }
    }
    
    document.getElementById('ventasHoy').innerText = ventasHoy;
    document.getElementById('ventaDelDia').innerText = formatearMoneda(montoHoy);
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