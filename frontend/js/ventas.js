// ventas.js - Sistema de ventas

var productos = JSON.parse(localStorage.getItem('productos')) || [];
var carrito = [];
var productoActual = null;

document.addEventListener('DOMContentLoaded', function() {
    actualizarCarrito();
    productos = JSON.parse(localStorage.getItem('productos')) || [];
});

var busqueda = document.getElementById('busqueda');
if (busqueda) {
    busqueda.addEventListener('input', buscarProducto);
}

function buscarProducto() {
    var texto = busqueda.value.toLowerCase().trim();
    var info = document.getElementById('infoProducto');
    
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    if (texto === '') {
        info.innerHTML = '';
        productoActual = null;
        return;
    }
    
    var encontrados = [];
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].nombre.toLowerCase().includes(texto)) {
            encontrados.push(productos[i]);
        }
    }
    
    if (encontrados.length === 0) {
        info.innerHTML = '<p style="color:#dc2626; font-weight:bold; margin-top: 10px;">Producto no encontrado</p>';
        productoActual = null;
        return;
    }
    
    if (encontrados.length === 1) {
        mostrarProductoEncontrado(encontrados[0]);
        productoActual = encontrados[0];
        return;
    }
    
    var html = '<div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">';
    html += '<p style="font-weight:bold; margin-bottom: 10px;">Seleccione un producto:</p>';
    html += '<div style="display:flex; flex-direction:column; gap:8px;">';
    
    for (var i = 0; i < encontrados.length; i++) {
        var p = encontrados[i];
        html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f8fafc; border-radius:8px; cursor:pointer;" onclick="seleccionarProducto(\'' + p.id + '\')">';
        html += '<span><strong>' + p.nombre + '</strong> - ' + formatearMoneda(p.precio) + '</span>';
        html += '<span style="font-size:0.8rem; color:#64748b;">Stock: ' + p.stock + '</span>';
        html += '</div>';
    }
    
    html += '</div></div>';
    info.innerHTML = html;
}

function seleccionarProducto(id) {
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    var producto = null;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].id === id) {
            producto = productos[i];
            break;
        }
    }
    
    if (producto) {
        productoActual = producto;
        mostrarProductoEncontrado(producto);
        document.getElementById('busqueda').value = producto.nombre;
    }
}

function mostrarProductoEncontrado(producto) {
    var info = document.getElementById('infoProducto');
    info.innerHTML = 
        '<div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">' +
        '<h3 style="color: #0f172a; font-size: 1.1rem; margin-bottom: 5px;">' + producto.nombre + '</h3>' +
        '<p style="font-size: 20px; font-weight: bold; color: #10b981;">Precio: ' + formatearMoneda(producto.precio) + '</p>' +
        '<p style="color: #64748b; font-size: 0.9rem;">Stock disponible: ' + producto.stock + ' u.</p>' +
        '<p style="color: #64748b; font-size: 0.8rem;">Categoria: ' + (producto.categoria || 'General') + '</p>' +
        '</div>';
}

function agregarAlCarrito() {
    var cantidadInput = document.getElementById('cantidad');
    var cantidad = parseInt(cantidadInput.value);
    
    if (!productoActual) {
        mostrarToast('Busque y seleccione un producto primero', 'error');
        return;
    }
    
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    var productoExiste = false;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].id === productoActual.id) {
            productoExiste = true;
            productoActual = productos[i];
            break;
        }
    }
    
    if (!productoExiste) {
        mostrarToast('El producto ya no existe', 'error');
        productoActual = null;
        return;
    }
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarToast('Ingrese una cantidad valida', 'error');
        return;
    }
    
    if (cantidad > productoActual.stock) {
        mostrarToast('Stock insuficiente. Stock disponible: ' + productoActual.stock, 'error');
        return;
    }
    
    var itemExistente = null;
    for (var i = 0; i < carrito.length; i++) {
        if (carrito[i].producto.id === productoActual.id) {
            itemExistente = carrito[i];
            break;
        }
    }
    
    if (itemExistente) {
        if (itemExistente.cantidad + cantidad > productoActual.stock) {
            mostrarToast('Stock insuficiente para agregar mas', 'error');
            return;
        }
        itemExistente.cantidad += cantidad;
        itemExistente.subtotal = itemExistente.producto.precio * itemExistente.cantidad;
    } else {
        var subtotal = productoActual.precio * cantidad;
        carrito.push({
            producto: {
                id: productoActual.id,
                nombre: productoActual.nombre,
                precio: productoActual.precio
            },
            cantidad: cantidad,
            subtotal: subtotal
        });
    }
    
    actualizarCarrito();
    cantidadInput.value = '';
    busqueda.value = '';
    document.getElementById('infoProducto').innerHTML = '';
    productoActual = null;
    mostrarToast('Producto agregado al carrito', 'success');
}

function eliminarDelCarrito(index) {
    if (confirm('Eliminar este producto del carrito?')) {
        carrito.splice(index, 1);
        actualizarCarrito();
        mostrarToast('Producto eliminado del carrito', 'warning');
    }
}

function actualizarCarrito() {
    var tabla = document.getElementById('tablaCarrito');
    var html = '';
    
    for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        html += '<tr>';
        html += '<td>' + item.producto.nombre + '</td>';
        html += '<td>' + item.cantidad + '</td>';
        html += '<td>' + formatearMoneda(item.producto.precio) + '</td>';
        html += '<td>' + formatearMoneda(item.subtotal) + '</td>';
        html += '<td><button class="btn-carrito-eliminar" onclick="eliminarDelCarrito(' + i + ')">X</button></td>';
        html += '</tr>';
    }
    
    tabla.innerHTML = html;
    
    var total = 0;
    for (var i = 0; i < carrito.length; i++) {
        total += carrito[i].subtotal;
    }
    
    document.getElementById('totalGeneral').innerHTML = 
        '<strong>Total: ' + formatearMoneda(total) + '</strong>';
}

function finalizarVenta() {
    if (carrito.length === 0) {
        mostrarToast('No hay productos en el carrito', 'error');
        return;
    }
    
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        var producto = null;
        for (var j = 0; j < productos.length; j++) {
            if (productos[j].id === item.producto.id) {
                producto = productos[j];
                break;
            }
        }
        if (!producto) {
            mostrarToast('El producto ' + item.producto.nombre + ' ya no existe', 'error');
            return;
        }
        if (producto.stock < item.cantidad) {
            mostrarToast('Stock insuficiente para ' + item.producto.nombre, 'error');
            return;
        }
    }
    
    var metodoPago = document.getElementById('metodoPago') ? document.getElementById('metodoPago').value : 'efectivo';
    var usuario = getUsuarioActual();
    
    var total = 0;
    for (var i = 0; i < carrito.length; i++) {
        total += carrito[i].subtotal;
    }
    
    var productosVenta = [];
    for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        productosVenta.push({
            id: item.producto.id,
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio,
            subtotal: item.subtotal
        });
    }
    
    var venta = {
        id: generarId(),
        fecha: new Date().toLocaleString(),
        productos: productosVenta,
        total: total,
        metodo_pago: metodoPago,
        usuario: usuario ? usuario.nombre_completo : 'Anonimo',
        usuario_id: usuario ? usuario.id : null
    };
    
    var ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    ventas.push(venta);
    localStorage.setItem('ventas', JSON.stringify(ventas));
    
    for (var i = 0; i < carrito.length; i++) {
        var item = carrito[i];
        for (var j = 0; j < productos.length; j++) {
            if (productos[j].id === item.producto.id) {
                productos[j].stock -= item.cantidad;
                break;
            }
        }
    }
    localStorage.setItem('productos', JSON.stringify(productos));
    
    generarTicket(venta);
    
    carrito = [];
    actualizarCarrito();
    busqueda.value = '';
    document.getElementById('infoProducto').innerHTML = '';
    
    mostrarToast('Venta registrada correctamente', 'success');
    productos = JSON.parse(localStorage.getItem('productos')) || [];
}

function generarTicket(venta) {
    var ticket = '========================================\n';
    ticket += '         KIOSCO SYS - TICKET          \n';
    ticket += '========================================\n';
    ticket += 'Fecha: ' + venta.fecha + '\n';
    ticket += 'Vendedor: ' + venta.usuario + '\n';
    ticket += 'Metodo: ' + venta.metodo_pago + '\n';
    ticket += '----------------------------------------\n';
    ticket += 'Productos:\n';
    
    for (var i = 0; i < venta.productos.length; i++) {
        var p = venta.productos[i];
        ticket += '  ' + p.nombre + ' x' + p.cantidad + ' = ' + formatearMoneda(p.subtotal) + '\n';
    }
    
    ticket += '----------------------------------------\n';
    ticket += 'TOTAL: ' + formatearMoneda(venta.total) + '\n';
    ticket += '========================================\n';
    
    console.log(ticket);
    mostrarToast('Ticket generado. Revisa la consola.', 'info');
    
    var blob = new Blob([ticket], { type: 'text/plain;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'ticket_' + venta.id + '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}