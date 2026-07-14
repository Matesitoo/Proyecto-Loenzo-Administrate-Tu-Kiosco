// productos.js - Gestion de productos

var productos = JSON.parse(localStorage.getItem('productos')) || [];
var productosFiltrados = [];
var filtroTexto = '';
var filtroCategoria = '';

document.addEventListener('DOMContentLoaded', function() {
    cargarCategorias();
    cargarFiltroCategorias();
    // Mostrar todos los productos al cargar
    productosFiltrados = [];
    for (var i = 0; i < productos.length; i++) {
        productosFiltrados.push(productos[i]);
    }
    mostrarProductosFiltrados();
    agregarBotonExportar();
    configurarBuscador();
});

function guardarProductos() {
    localStorage.setItem('productos', JSON.stringify(productos));
}

function agregarProducto() {
    var nombre = document.getElementById('nombre').value.trim();
    var categoria = document.getElementById('categoria').value;
    var precio = parseFloat(document.getElementById('precio').value);
    var stock = parseInt(document.getElementById('stock').value);
    var stockMinimo = parseInt(document.getElementById('stockMinimo').value) || 5;
    
    if (nombre === '') {
        mostrarToast('El nombre es obligatorio', 'error');
        return;
    }
    
    if (!validarNumeroPositivo(precio, 'Precio')) return;
    if (!validarNumeroPositivo(stock, 'Stock')) return;
    
    var nuevoProducto = { 
        id: generarId(),
        nombre: nombre, 
        categoria: categoria,
        precio: precio, 
        stock: stock,
        stock_minimo: stockMinimo,
        fecha_creacion: new Date().toISOString()
    };
    
    productos.push(nuevoProducto);
    guardarProductos();
    limpiarFormulario();
    // Recargar la lista manteniendo el filtro si existe
    if (filtroTexto !== '' || filtroCategoria !== '') {
        buscarProductos();
    } else {
        productosFiltrados = [];
        for (var i = 0; i < productos.length; i++) {
            productosFiltrados.push(productos[i]);
        }
        mostrarProductosFiltrados();
    }
    mostrarToast('Producto agregado correctamente', 'success');
}

function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('stockMinimo').value = '5';
}

function eliminarProducto(id) {
    mostrarModalConfirmacion('¿Esta seguro de eliminar este producto?', function() {
        var nuevosProductos = [];
        for (var i = 0; i < productos.length; i++) {
            if (productos[i].id !== id) {
                nuevosProductos.push(productos[i]);
            }
        }
        productos = nuevosProductos;
        guardarProductos();
        // Recargar la lista manteniendo el filtro si existe
        if (filtroTexto !== '' || filtroCategoria !== '') {
            buscarProductos();
        } else {
            productosFiltrados = [];
            for (var i = 0; i < productos.length; i++) {
                productosFiltrados.push(productos[i]);
            }
            mostrarProductosFiltrados();
        }
        mostrarToast('Producto eliminado', 'warning');
    });
}

function editarProducto(id) {
    var producto = null;
    var indice = -1;
    for (var i = 0; i < productos.length; i++) {
        if (productos[i].id === id) {
            producto = productos[i];
            indice = i;
            break;
        }
    }
    
    if (!producto) {
        mostrarToast('Producto no encontrado', 'error');
        return;
    }
    
    mostrarModalEdicion(producto, function(datos) {
        productos[indice].nombre = datos.nombre;
        productos[indice].categoria = datos.categoria;
        productos[indice].precio = datos.precio;
        productos[indice].stock = datos.stock;
        productos[indice].stock_minimo = datos.stock_minimo;
        
        guardarProductos();
        // Recargar la lista manteniendo el filtro si existe
        if (filtroTexto !== '' || filtroCategoria !== '') {
            buscarProductos();
        } else {
            productosFiltrados = [];
            for (var i = 0; i < productos.length; i++) {
                productosFiltrados.push(productos[i]);
            }
            mostrarProductosFiltrados();
        }
        mostrarToast('Producto actualizado', 'info');
    });
}

// ============================================
// BUSCADOR DE PRODUCTOS
// ============================================

function configurarBuscador() {
    var input = document.getElementById('buscadorProductos');
    var filtroCat = document.getElementById('filtroCategoria');
    
    if (input) {
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                buscarProductos();
            }
        });
    }
    
    if (filtroCat) {
        filtroCat.addEventListener('change', function() {
            buscarProductos();
        });
    }
}

function buscarProductos() {
    var input = document.getElementById('buscadorProductos');
    var filtroCat = document.getElementById('filtroCategoria');
    
    filtroTexto = input ? input.value.toLowerCase().trim() : '';
    filtroCategoria = filtroCat ? filtroCat.value : '';
    
    productosFiltrados = [];
    
    for (var i = 0; i < productos.length; i++) {
        var p = productos[i];
        var coincideTexto = true;
        var coincideCategoria = true;
        
        if (filtroTexto !== '') {
            coincideTexto = p.nombre.toLowerCase().includes(filtroTexto);
        }
        
        if (filtroCategoria !== '') {
            coincideCategoria = p.categoria === filtroCategoria;
        }
        
        if (coincideTexto && coincideCategoria) {
            productosFiltrados.push(p);
        }
    }
    
    mostrarProductosFiltrados();
}

function limpiarBusqueda() {
    var input = document.getElementById('buscadorProductos');
    var filtroCat = document.getElementById('filtroCategoria');
    
    if (input) input.value = '';
    if (filtroCat) filtroCat.value = '';
    
    filtroTexto = '';
    filtroCategoria = '';
    
    productosFiltrados = [];
    for (var i = 0; i < productos.length; i++) {
        productosFiltrados.push(productos[i]);
    }
    
    mostrarProductosFiltrados();
    mostrarToast('Filtros limpiados', 'info');
}

function mostrarProductosFiltrados() {
    var tabla = document.getElementById('tablaProductos');
    var html = '';
    var contador = document.getElementById('contadorProductos');
    
    if (productosFiltrados.length === 0) {
        if (productos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No hay productos registrados</td></tr>';
            if (contador) contador.innerText = 'Mostrando 0 productos';
        } else {
            tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No se encontraron productos con esos filtros</td></tr>';
            if (contador) contador.innerText = 'Mostrando 0 productos (de ' + productos.length + ' totales)';
        }
        return;
    }
    
    for (var i = 0; i < productosFiltrados.length; i++) {
        var producto = productosFiltrados[i];
        var stockBajo = producto.stock <= (producto.stock_minimo || 5);
        var colorStock = stockBajo ? '#dc2626' : '#16a34a';
        var indicadorStock = stockBajo ? ' ⚠️' : ' ✅';
        
        html += '<tr>';
        html += '<td>' + producto.nombre + '</td>';
        html += '<td>' + (producto.categoria || 'General') + '</td>';
        html += '<td>' + formatearMoneda(producto.precio) + '</td>';
        html += '<td style="color: ' + colorStock + '; font-weight:bold;">' + producto.stock + indicadorStock + '</td>';
        html += '<td>';
        html += '<button class="btn-editar" onclick="editarProducto(\'' + producto.id + '\')">Editar</button>';
        html += '<button class="btn-eliminar" onclick="eliminarProducto(\'' + producto.id + '\')">Eliminar</button>';
        html += '</td>';
        html += '</tr>';
    }
    tabla.innerHTML = html;
    
    if (contador) {
        if (productosFiltrados.length === productos.length) {
            contador.innerText = 'Mostrando ' + productosFiltrados.length + ' productos';
        } else {
            contador.innerText = 'Mostrando ' + productosFiltrados.length + ' productos (de ' + productos.length + ' totales)';
        }
    }
}

// ============================================
// CARGAR CATEGORIAS
// ============================================

function cargarCategorias() {
    var select = document.getElementById('categoria');
    if (!select) return;
    
    select.innerHTML = '';
    
    var categorias = [
        'General', 'Bebidas', 'Bebidas alcoholicas', 'Aguas saborizadas',
        'Gaseosas', 'Jugos', 'Snacks', 'Golosinas', 'Chocolates',
        'Galletitas', 'Comestibles', 'Enlatados', 'Pastas',
        'Arroz y legumbres', 'Higiene', 'Cuidado personal',
        'Limpieza', 'Farmacia', 'Lacteos', 'Fiambres',
        'Panificados', 'Congelados', 'Otros'
    ];
    
    for (var i = 0; i < categorias.length; i++) {
        var option = document.createElement('option');
        option.value = categorias[i];
        option.textContent = categorias[i];
        select.appendChild(option);
    }
}

function cargarFiltroCategorias() {
    var select = document.getElementById('filtroCategoria');
    if (!select) return;
    
    // Limpiar opciones excepto la primera
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Obtener categorias unicas de los productos
    var categoriasUnicas = {};
    for (var i = 0; i < productos.length; i++) {
        var cat = productos[i].categoria || 'General';
        categoriasUnicas[cat] = true;
    }
    
    var categorias = Object.keys(categoriasUnicas).sort();
    for (var i = 0; i < categorias.length; i++) {
        var option = document.createElement('option');
        option.value = categorias[i];
        option.textContent = categorias[i];
        select.appendChild(option);
    }
}

// ============================================
// BOTON EXPORTAR
// ============================================

function agregarBotonExportar() {
    var contenedor = document.querySelector('.contenido-principal');
    var botonExistente = document.getElementById('btnExportarInventario');
    if (botonExistente) return;
    
    var boton = document.createElement('button');
    boton.id = 'btnExportarInventario';
    boton.innerText = 'Exportar Inventario a Excel';
    boton.style.cssText = 'margin-top: 15px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
    
    boton.onclick = function() {
        if (productos.length === 0) {
            mostrarToast('No hay productos para exportar', 'error');
            return;
        }
        
        var csvContent = 'ID;Nombre;Categoria;Precio;Stock;Stock Minimo;Fecha\n';
        for (var i = 0; i < productos.length; i++) {
            var p = productos[i];
            csvContent += p.id + ';' + p.nombre + ';' + (p.categoria || 'General') + ';' + p.precio + ';' + p.stock + ';' + (p.stock_minimo || 5) + ';' + (p.fecha_creacion || '') + '\n';
        }
        
        var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'inventario_kiosco_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarToast('Inventario exportado correctamente', 'success');
    };
    contenedor.appendChild(boton);
}

// ============================================
// MODALES
// ============================================

function mostrarModalEdicion(producto, callback) {
    var overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'background:white; border-radius:15px; padding:30px; max-width:450px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    
    var categorias = [
        'General', 'Bebidas', 'Bebidas alcoholicas', 'Aguas saborizadas',
        'Gaseosas', 'Jugos', 'Snacks', 'Golosinas', 'Chocolates',
        'Galletitas', 'Comestibles', 'Enlatados', 'Pastas',
        'Arroz y legumbres', 'Higiene', 'Cuidado personal',
        'Limpieza', 'Farmacia', 'Lacteos', 'Fiambres',
        'Panificados', 'Congelados', 'Otros'
    ];
    
    var optionsHtml = '';
    for (var i = 0; i < categorias.length; i++) {
        var selected = (categorias[i] === producto.categoria) ? 'selected' : '';
        optionsHtml += '<option value="' + categorias[i] + '" ' + selected + '>' + categorias[i] + '</option>';
    }
    
    modal.innerHTML = `
        <h2 style="margin-bottom:20px; color:#0f172a; text-align:center;">Editar Producto</h2>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Nombre</label>
            <input type="text" id="modalNombre" value="${producto.nombre}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Categoria</label>
            <select id="modalCategoria" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
                ${optionsHtml}
            </select>
        </div>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Precio</label>
            <input type="number" id="modalPrecio" value="${producto.precio}" step="0.01" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Stock</label>
            <input type="number" id="modalStock" value="${producto.stock}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="margin-bottom:20px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Stock Minimo</label>
            <input type="number" id="modalStockMinimo" value="${producto.stock_minimo || 5}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
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
        var nombre = document.getElementById('modalNombre').value.trim();
        var categoria = document.getElementById('modalCategoria').value;
        var precio = parseFloat(document.getElementById('modalPrecio').value);
        var stock = parseInt(document.getElementById('modalStock').value);
        var stockMinimo = parseInt(document.getElementById('modalStockMinimo').value) || 5;
        
        if (nombre === '') {
            mostrarToast('El nombre es obligatorio', 'error');
            return;
        }
        if (!validarNumeroPositivo(precio, 'Precio')) return;
        if (!validarNumeroPositivo(stock, 'Stock')) return;
        
        document.body.removeChild(overlay);
        callback({
            nombre: nombre,
            categoria: categoria,
            precio: precio,
            stock: stock,
            stock_minimo: stockMinimo
        });
    };
    
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

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