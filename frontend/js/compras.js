// compras.js - Gestion de pedidos a proveedores

var pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
var productos = JSON.parse(localStorage.getItem('productos')) || [];
var proveedores = JSON.parse(localStorage.getItem('proveedores')) || [];
var comprasItems = [];
var productoSeleccionado = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarProveedoresSelect();
    mostrarCompras();
    agregarBotonExportarCompras();
    comprasItems = [];
    mostrarListaCompra();
    configurarBuscadorProductos();
});

function guardarCompras() {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function cargarProveedoresSelect() {
    var select = document.getElementById('compraProveedor');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccione un proveedor</option>';
    for (var i = 0; i < proveedores.length; i++) {
        var option = document.createElement('option');
        option.value = proveedores[i].id;
        option.textContent = proveedores[i].nombre;
        select.appendChild(option);
    }
}

// ============================================
// BUSCADOR DE PRODUCTOS
// ============================================

function configurarBuscadorProductos() {
    var input = document.getElementById('buscarProducto');
    var resultadosDiv = document.getElementById('resultadosProductos');
    if (!input || !resultadosDiv) return;
    
    input.addEventListener('input', function() {
        var texto = this.value.toLowerCase().trim();
        productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        if (texto === '') {
            resultadosDiv.style.display = 'none';
            productoSeleccionado = null;
            document.getElementById('productoSeleccionadoInfo').style.display = 'none';
            return;
        }
        
        var encontrados = [];
        for (var i = 0; i < productos.length; i++) {
            if (productos[i].nombre.toLowerCase().includes(texto)) {
                encontrados.push(productos[i]);
            }
        }
        
        if (encontrados.length === 0) {
            resultadosDiv.innerHTML = '<div style="padding:10px; color:#94a3b8; text-align:center;">No se encontraron productos</div>';
            resultadosDiv.style.display = 'block';
            return;
        }
        
        var html = '';
        for (var i = 0; i < encontrados.length; i++) {
            var p = encontrados[i];
            html += '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #f1f5f9; cursor:pointer;" onclick="seleccionarProducto(\'' + p.id + '\')">';
            html += '<span><strong>' + p.nombre + '</strong> - ' + formatearMoneda(p.precio) + '</span>';
            html += '<span style="font-size:0.8rem; color:#64748b;">Stock: ' + p.stock + '</span>';
            html += '</div>';
        }
        
        resultadosDiv.innerHTML = html;
        resultadosDiv.style.display = 'block';
    });
    
    document.addEventListener('click', function(e) {
        if (e.target !== input && !resultadosDiv.contains(e.target)) {
            resultadosDiv.style.display = 'none';
        }
    });
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
        productoSeleccionado = producto;
        document.getElementById('buscarProducto').value = producto.nombre;
        document.getElementById('resultadosProductos').style.display = 'none';
        
        var infoDiv = document.getElementById('productoSeleccionadoInfo');
        infoDiv.style.display = 'block';
        document.getElementById('nombreProductoSeleccionado').innerText = producto.nombre;
        document.getElementById('stockProductoSeleccionado').innerText = producto.stock;
    }
}

// ============================================
// AGREGAR PRODUCTO SIN PRECIO
// ============================================

function agregarProductoACompra() {
    if (!productoSeleccionado) {
        mostrarToast('Busque y seleccione un producto primero', 'error');
        return;
    }
    
    var cantidad = parseInt(document.getElementById('compraCantidad').value);
    
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarToast('Ingrese una cantidad valida', 'error');
        return;
    }
    
    if (cantidad > productoSeleccionado.stock) {
        mostrarToast('Stock insuficiente. Stock disponible: ' + productoSeleccionado.stock, 'error');
        return;
    }
    
    var productoId = productoSeleccionado.id;
    
    var existente = false;
    for (var i = 0; i < comprasItems.length; i++) {
        if (comprasItems[i].productoId === productoId) {
            comprasItems[i].cantidad += cantidad;
            existente = true;
            break;
        }
    }
    
    if (!existente) {
        comprasItems.push({
            productoId: productoId,
            nombre: productoSeleccionado.nombre,
            cantidad: cantidad
        });
    }
    
    mostrarListaCompra();
    document.getElementById('compraCantidad').value = '';
    document.getElementById('buscarProducto').value = '';
    document.getElementById('resultadosProductos').style.display = 'none';
    document.getElementById('productoSeleccionadoInfo').style.display = 'none';
    productoSeleccionado = null;
    mostrarToast('Producto agregado a la compra', 'success');
}

function eliminarItemCompra(index) {
    mostrarModalConfirmacion('¿Esta seguro de eliminar este producto de la compra?', function() {
        comprasItems.splice(index, 1);
        mostrarListaCompra();
        mostrarToast('Producto eliminado de la compra', 'warning');
    });
}

function editarItemCompra(index) {
    var item = comprasItems[index];
    if (!item) return;
    
    mostrarModalEdicionItemCompra(item, function(datos) {
        comprasItems[index].cantidad = datos.cantidad;
        mostrarListaCompra();
        mostrarToast('Producto actualizado', 'info');
    });
}

function mostrarModalEdicionItemCompra(item, callback) {
    var overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'background:white; border-radius:15px; padding:30px; max-width:450px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    
    modal.innerHTML = `
        <h2 style="margin-bottom:20px; color:#0f172a; text-align:center;">Editar Cantidad</h2>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Producto</label>
            <p style="padding:10px; background:#f1f5f9; border-radius:8px; color:#1e293b; font-weight:500;">${item.nombre}</p>
        </div>
        
        <div style="margin-bottom:20px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Cantidad</label>
            <input type="number" id="modalCantidad" value="${item.cantidad}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button id="modalCancelar" style="padding:10px 25px; background:#94a3b8; color:white; border:none; border-radius:8px; cursor:pointer;">Cancelar</button>
            <button id="modalGuardar" style="padding:10px 25px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer;">Guardar</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('modalCancelar').onclick = function() {
        document.body.removeChild(overlay);
    };
    
    document.getElementById('modalGuardar').onclick = function() {
        var cantidad = parseInt(document.getElementById('modalCantidad').value);
        
        if (isNaN(cantidad) || cantidad <= 0) {
            mostrarToast('Ingrese una cantidad valida', 'error');
            return;
        }
        
        document.body.removeChild(overlay);
        callback({ cantidad: cantidad });
    };
    
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

function mostrarListaCompra() {
    var lista = document.getElementById('listaCompraItems');
    if (!lista) return;
    
    if (comprasItems.length === 0) {
        lista.innerHTML = '<li style="text-align:center; color:#94a3b8; padding:15px;">No hay productos agregados</li>';
        document.getElementById('compraSubtotal').innerText = '$0';
        return;
    }
    
    var html = '';
    for (var i = 0; i < comprasItems.length; i++) {
        var item = comprasItems[i];
        html += '<li style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #e2e8f0;">';
        html += '<span>' + item.nombre + ' x' + item.cantidad + '</span>';
        html += '<span style="display:flex; align-items:center; gap:8px;">';
        html += '<button class="btn-editar" onclick="editarItemCompra(' + i + ')" style="padding:4px 10px; font-size:12px;">Editar</button>';
        html += '<button class="btn-eliminar" onclick="eliminarItemCompra(' + i + ')" style="padding:4px 10px; font-size:12px;">X</button>';
        html += '</span>';
        html += '</li>';
    }
    lista.innerHTML = html;
    document.getElementById('compraSubtotal').innerText = '$0'; // No mostramos subtotal porque no hay precio
}

// ============================================
// CAMBIAR ESTADO DE COMPRA
// ============================================

function cambiarEstadoCompra(id, nuevoEstado) {
    var compra = null;
    var indice = -1;
    for (var i = 0; i < pedidos.length; i++) {
        if (pedidos[i].id === id) {
            compra = pedidos[i];
            indice = i;
            break;
        }
    }
    
    if (!compra) {
        mostrarToast('Pedido no encontrado', 'error');
        return;
    }
    
    var estadoActual = compra.estado || 'Pendiente';
    
    if (estadoActual === nuevoEstado) {
        mostrarToast('El estado ya es ' + nuevoEstado, 'info');
        return;
    }
    
    productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    // Pendiente -> Entregado: SUMA STOCK
    if (estadoActual === 'Pendiente' && nuevoEstado === 'Entregado') {
        for (var j = 0; j < compra.items.length; j++) {
            var item = compra.items[j];
            for (var k = 0; k < productos.length; k++) {
                if (productos[k].id === item.productoId) {
                    productos[k].stock += item.cantidad;
                    break;
                }
            }
        }
        localStorage.setItem('productos', JSON.stringify(productos));
        pedidos[indice].estado = nuevoEstado;
        guardarCompras();
        mostrarCompras();
        mostrarToast('Pedido marcado como Entregado. Stock actualizado (+' + compra.items.length + ' productos).', 'success');
        return;
    }
    
    // Entregado -> Devuelto: RESTA STOCK
    if (estadoActual === 'Entregado' && nuevoEstado === 'Devuelto') {
        for (var j = 0; j < compra.items.length; j++) {
            var item = compra.items[j];
            for (var k = 0; k < productos.length; k++) {
                if (productos[k].id === item.productoId) {
                    productos[k].stock -= item.cantidad;
                    if (productos[k].stock < 0) productos[k].stock = 0;
                    break;
                }
            }
        }
        localStorage.setItem('productos', JSON.stringify(productos));
        pedidos[indice].estado = nuevoEstado;
        guardarCompras();
        mostrarCompras();
        mostrarToast('Pedido marcado como Devuelto. Stock actualizado (-' + compra.items.length + ' productos).', 'warning');
        return;
    }
    
    // Devuelto -> Pendiente: SUMA STOCK
    if (estadoActual === 'Devuelto' && nuevoEstado === 'Pendiente') {
        for (var j = 0; j < compra.items.length; j++) {
            var item = compra.items[j];
            for (var k = 0; k < productos.length; k++) {
                if (productos[k].id === item.productoId) {
                    productos[k].stock += item.cantidad;
                    break;
                }
            }
        }
        localStorage.setItem('productos', JSON.stringify(productos));
        pedidos[indice].estado = nuevoEstado;
        guardarCompras();
        mostrarCompras();
        mostrarToast('Pedido marcado como Pendiente. Stock actualizado (+' + compra.items.length + ' productos).', 'info');
        return;
    }
    
    // Devuelto -> Entregado: SUMA STOCK
    if (estadoActual === 'Devuelto' && nuevoEstado === 'Entregado') {
        for (var j = 0; j < compra.items.length; j++) {
            var item = compra.items[j];
            for (var k = 0; k < productos.length; k++) {
                if (productos[k].id === item.productoId) {
                    productos[k].stock += item.cantidad;
                    break;
                }
            }
        }
        localStorage.setItem('productos', JSON.stringify(productos));
        pedidos[indice].estado = nuevoEstado;
        guardarCompras();
        mostrarCompras();
        mostrarToast('Pedido marcado como Entregado. Stock actualizado (+' + compra.items.length + ' productos).', 'success');
        return;
    }
    
    // Pendiente -> Devuelto: NO AFECTA STOCK
    if (estadoActual === 'Pendiente' && nuevoEstado === 'Devuelto') {
        pedidos[indice].estado = nuevoEstado;
        guardarCompras();
        mostrarCompras();
        mostrarToast('Pedido marcado como Devuelto. (No se habia sumado stock porque estaba Pendiente)', 'warning');
        return;
    }
    
    // Entregado -> Pendiente: RESTA STOCK
    if (estadoActual === 'Entregado' && nuevoEstado === 'Pendiente') {
        for (var j = 0; j < compra.items.length; j++) {
            var item = compra.items[j];
            for (var k = 0; k < productos.length; k++) {
                if (productos[k].id === item.productoId) {
                    productos[k].stock -= item.cantidad;
                    if (productos[k].stock < 0) productos[k].stock = 0;
                    break;
                }
            }
        }
        localStorage.setItem('productos', JSON.stringify(productos));
        pedidos[indice].estado = nuevoEstado;
        guardarCompras();
        mostrarCompras();
        mostrarToast('Pedido marcado como Pendiente. Stock actualizado (-' + compra.items.length + ' productos).', 'info');
        return;
    }
    
    pedidos[indice].estado = nuevoEstado;
    guardarCompras();
    mostrarCompras();
    mostrarToast('Estado actualizado', 'info');
}

function getEstadoHTML(estado) {
    var colores = {
        'Pendiente': { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
        'Entregado': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
        'Devuelto': { bg: '#fee2e2', text: '#991b1b', border: '#dc2626' }
    };
    
    var color = colores[estado] || colores['Pendiente'];
    var emoji = estado === 'Pendiente' ? '⏳' : estado === 'Entregado' ? '✅' : '❌';
    
    return '<span style="display:inline-block; padding:4px 12px; border-radius:20px; background:' + color.bg + '; color:' + color.text + '; border:1px solid ' + color.border + '; font-weight:500; font-size:13px;">' + emoji + ' ' + estado + '</span>';
}

// ============================================
// MODAL DE ESTADO
// ============================================

function mostrarModalEstado(id) {
    var compra = null;
    for (var i = 0; i < pedidos.length; i++) {
        if (pedidos[i].id === id) {
            compra = pedidos[i];
            break;
        }
    }
    
    if (!compra) {
        mostrarToast('Pedido no encontrado', 'error');
        return;
    }
    
    var estadoActual = compra.estado || 'Pendiente';
    var estadoSeleccionado = estadoActual;
    
    var coloresEstado = {
        'Pendiente': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', hover: '#fde68a' },
        'Entregado': { bg: '#d1fae5', border: '#10b981', text: '#065f46', hover: '#a7f3d0' },
        'Devuelto': { bg: '#fee2e2', border: '#dc2626', text: '#991b1b', hover: '#fca5a5' }
    };
    
    var overlay = document.createElement('div');
    overlay.id = 'modalEstadoOverlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.5); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:9999;';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'background:white; border-radius:16px; padding:28px; max-width:380px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.25);';
    
    var opciones = ['Pendiente', 'Entregado', 'Devuelto'];
    var opcionesHTML = '';
    var emojis = { 'Pendiente': '⏳', 'Entregado': '✅', 'Devuelto': '❌' };
    
    for (var i = 0; i < opciones.length; i++) {
        var estado = opciones[i];
        var esActual = (estado === estadoActual);
        var color = coloresEstado[estado];
        var seleccionado = (estado === estadoSeleccionado);
        
        opcionesHTML += `
            <div class="estado-opcion" data-estado="${estado}" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:10px; cursor:pointer; margin-bottom:8px; background:${seleccionado ? color.bg : '#f8fafc'}; border:2px solid ${seleccionado ? color.border : 'transparent'}; transition:all 0.2s ease;">
                <span style="font-size:14px; color:${seleccionado ? color.text : '#334155'}; font-weight:${seleccionado ? '600' : '400'};">${emojis[estado]} ${estado}</span>
                ${esActual ? '<span style="background:' + color.border + '; color:white; padding:2px 12px; border-radius:12px; font-size:10px; font-weight:700; letter-spacing:0.5px;">ACTUAL</span>' : ''}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <h2 style="margin:0 0 5px 0; color:#0f172a; text-align:center; font-size:1.2rem; font-weight:700;">Cambiar Estado</h2>
        <p style="text-align:center; color:#64748b; margin:0 0 20px 0; font-size:13px;">Estado actual: ${getEstadoHTML(estadoActual)}</p>
        
        <div id="opcionesEstado" style="display:flex; flex-direction:column;">
            ${opcionesHTML}
        </div>
        
        <div style="display:flex; gap:10px; justify-content:center; margin-top:22px;">
            <button id="modalEstadoCancelar" style="padding:9px 28px; background:#e2e8f0; color:#475569; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; transition:all 0.2s;">Cancelar</button>
            <button id="modalEstadoGuardar" style="padding:9px 28px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; transition:all 0.2s;">Guardar</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    var opcionesDivs = modal.querySelectorAll('.estado-opcion');
    var estadoElegido = estadoActual;
    
    opcionesDivs.forEach(function(el) {
        el.addEventListener('click', function() {
            var estado = this.dataset.estado;
            var color = coloresEstado[estado];
            
            opcionesDivs.forEach(function(opt) {
                opt.style.background = '#f8fafc';
                opt.style.border = '2px solid transparent';
                opt.querySelector('span').style.color = '#334155';
                opt.querySelector('span').style.fontWeight = '400';
            });
            
            this.style.background = color.bg;
            this.style.border = '2px solid ' + color.border;
            this.querySelector('span').style.color = color.text;
            this.querySelector('span').style.fontWeight = '600';
            
            estadoElegido = estado;
        });
    });
    
    document.getElementById('modalEstadoCancelar').onmouseover = function() { this.style.background = '#cbd5e1'; };
    document.getElementById('modalEstadoCancelar').onmouseout = function() { this.style.background = '#e2e8f0'; };
    document.getElementById('modalEstadoGuardar').onmouseover = function() { this.style.background = '#1d4ed8'; };
    document.getElementById('modalEstadoGuardar').onmouseout = function() { this.style.background = '#2563eb'; };
    
    document.getElementById('modalEstadoCancelar').onclick = function() {
        document.body.removeChild(overlay);
    };
    
    document.getElementById('modalEstadoGuardar').onclick = function() {
        if (estadoElegido === estadoActual) {
            mostrarToast('El estado ya es ' + estadoElegido, 'info');
            document.body.removeChild(overlay);
            return;
        }
        document.body.removeChild(overlay);
        cambiarEstadoCompra(id, estadoElegido);
    };
    
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

// ============================================
// FINALIZAR PEDIDO CON MONTO TOTAL
// ============================================

function finalizarCompra() {
    var proveedorId = document.getElementById('compraProveedor').value;
    var montoTotal = parseFloat(document.getElementById('montoTotalPagar').value);
    
    if (!proveedorId) {
        mostrarToast('Seleccione un proveedor', 'error');
        return;
    }
    
    if (comprasItems.length === 0) {
        mostrarToast('Agregue al menos un producto', 'error');
        return;
    }
    
    if (isNaN(montoTotal) || montoTotal <= 0) {
        mostrarToast('Ingrese el monto total a pagar (debe ser mayor a 0)', 'error');
        return;
    }
    
    var proveedor = null;
    for (var i = 0; i < proveedores.length; i++) {
        if (proveedores[i].id === proveedorId) {
            proveedor = proveedores[i];
            break;
        }
    }
    
    var compra = {
        id: generarId(),
        fecha: new Date().toLocaleString(),
        proveedor: proveedor ? proveedor.nombre : 'Desconocido',
        proveedor_id: proveedorId,
        items: comprasItems.slice(),
        total: montoTotal, // Usamos el monto ingresado por el usuario
        usuario: getUsuarioActual() ? getUsuarioActual().nombre_completo : 'Anonimo',
        estado: 'Pendiente'
    };
    
    pedidos.push(compra);
    guardarCompras();
    
    comprasItems = [];
    mostrarListaCompra();
    document.getElementById('compraProveedor').value = '';
    document.getElementById('buscarProducto').value = '';
    document.getElementById('resultadosProductos').style.display = 'none';
    document.getElementById('productoSeleccionadoInfo').style.display = 'none';
    document.getElementById('montoTotalPagar').value = '';
    productoSeleccionado = null;
    mostrarCompras();
    
    mostrarToast('Pedido registrado correctamente. Estado: Pendiente (stock NO sumado)', 'success');
}

function mostrarCompras() {
    var tabla = document.getElementById('tablaCompras');
    if (!tabla) return;
    
    if (pedidos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">No hay pedidos registrados</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = pedidos.length - 1; i >= 0; i--) {
        var c = pedidos[i];
        var productosTexto = '';
        for (var j = 0; j < c.items.length; j++) {
            productosTexto += c.items[j].nombre + ' x' + c.items[j].cantidad + '<br>';
        }
        html += '<tr>';
        html += '<td>' + c.fecha + '</td>';
        html += '<td>' + c.proveedor + '</td>';
        html += '<td>' + productosTexto + '</td>';
        html += '<td>$' + c.total.toFixed(2) + '</td>';
        html += '<td>' + getEstadoHTML(c.estado || 'Pendiente') + '</td>';
        html += '<td><button class="btn-estado" onclick="mostrarModalEstado(\'' + c.id + '\')">Cambiar Estado</button></td>';
        html += '</tr>';
    }
    tabla.innerHTML = html;
}

function agregarBotonExportarCompras() {
    var contenedor = document.querySelector('.contenido-principal');
    if (!contenedor) return;
    
    var botonExistente = document.getElementById('btnExportarCompras');
    if (botonExistente) return;
    
    var boton = document.createElement('button');
    boton.id = 'btnExportarCompras';
    boton.innerText = 'Exportar Pedidos a Excel';
    boton.style.cssText = 'margin-top: 15px; padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
    
    boton.onclick = function() {
        if (pedidos.length === 0) {
            mostrarToast('No hay pedidos para exportar', 'error');
            return;
        }
        
        var csvContent = 'Fecha;Proveedor;Productos;Total;Estado;Usuario\n';
        for (var i = 0; i < pedidos.length; i++) {
            var c = pedidos[i];
            var prodLista = '';
            for (var j = 0; j < c.items.length; j++) {
                if (j > 0) prodLista += ' - ';
                prodLista += c.items[j].nombre + ' x' + c.items[j].cantidad;
            }
            csvContent += c.fecha + ';' + c.proveedor + ';' + prodLista + ';' + c.total + ';' + (c.estado || 'Pendiente') + ';' + c.usuario + '\n';
        }
        
        var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'pedidos_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarToast('Pedidos exportados correctamente', 'success');
    };
    contenedor.appendChild(boton);
}

// ============================================
// MODAL DE CONFIRMACION
// ============================================

function mostrarModalConfirmacion(mensaje, callback) {
    var existente = document.getElementById('modalConfirmOverlay');
    if (existente) {
        document.body.removeChild(existente);
    }
    
    var overlay = document.createElement('div');
    overlay.id = 'modalConfirmOverlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'background:white; border-radius:15px; padding:30px; max-width:400px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3); text-align:center;';
    
    modal.innerHTML = `
        <div style="font-size:48px; margin-bottom:15px;">⚠️</div>
        <h2 style="margin-bottom:15px; color:#0f172a;">Confirmar</h2>
        <p style="margin-bottom:25px; color:#334155; font-size:16px;">${mensaje}</p>
        <div style="display:flex; gap:10px; justify-content:center;">
            <button id="modalConfirmCancelar" style="padding:10px 25px; background:#94a3b8; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">Cancelar</button>
            <button id="modalConfirmAceptar" style="padding:10px 25px; background:#dc2626; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">Eliminar</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('modalConfirmCancelar').onclick = function() {
        if (document.getElementById('modalConfirmOverlay')) {
            document.body.removeChild(overlay);
        }
    };
    
    document.getElementById('modalConfirmAceptar').onclick = function() {
        if (document.getElementById('modalConfirmOverlay')) {
            document.body.removeChild(overlay);
        }
        callback();
    };
    
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            if (document.getElementById('modalConfirmOverlay')) {
                document.body.removeChild(overlay);
            }
        }
    };
}