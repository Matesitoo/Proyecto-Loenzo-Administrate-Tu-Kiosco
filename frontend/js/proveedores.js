// proveedores.js - Gestion de proveedores

var proveedores = JSON.parse(localStorage.getItem('proveedores')) || [];

document.addEventListener('DOMContentLoaded', function() {
    mostrarProveedores();
    agregarBotonExportarProveedores();
});

function guardarProveedores() {
    localStorage.setItem('proveedores', JSON.stringify(proveedores));
}

function agregarProveedor() {
    var nombre = document.getElementById('provNombre').value.trim();
    var telefono = document.getElementById('provTelefono').value.trim();
    var direccion = document.getElementById('provDireccion').value.trim();
    var email = document.getElementById('provEmail').value.trim();
    
    if (nombre === '') {
        mostrarToast('El nombre del proveedor es obligatorio', 'error');
        return;
    }
    
    proveedores.push({
        id: generarId(),
        nombre: nombre,
        telefono: telefono,
        direccion: direccion,
        email: email,
        fecha: new Date().toISOString()
    });
    
    guardarProveedores();
    mostrarProveedores();
    limpiarFormularioProveedor();
    mostrarToast('Proveedor agregado correctamente', 'success');
}

function limpiarFormularioProveedor() {
    document.getElementById('provNombre').value = '';
    document.getElementById('provTelefono').value = '';
    document.getElementById('provDireccion').value = '';
    document.getElementById('provEmail').value = '';
}

function eliminarProveedor(id) {
    mostrarModalConfirmacion('¿Esta seguro de eliminar este proveedor?', function() {
        var nuevosProveedores = [];
        for (var i = 0; i < proveedores.length; i++) {
            if (proveedores[i].id !== id) {
                nuevosProveedores.push(proveedores[i]);
            }
        }
        proveedores = nuevosProveedores;
        guardarProveedores();
        mostrarProveedores();
        mostrarToast('Proveedor eliminado', 'warning');
    });
}

function editarProveedor(id) {
    var proveedor = null;
    var indice = -1;
    for (var i = 0; i < proveedores.length; i++) {
        if (proveedores[i].id === id) {
            proveedor = proveedores[i];
            indice = i;
            break;
        }
    }
    
    if (!proveedor) {
        mostrarToast('Proveedor no encontrado', 'error');
        return;
    }
    
    mostrarModalEdicionProveedor(proveedor, function(datos) {
        proveedores[indice].nombre = datos.nombre;
        proveedores[indice].telefono = datos.telefono;
        proveedores[indice].direccion = datos.direccion;
        proveedores[indice].email = datos.email;
        
        guardarProveedores();
        mostrarProveedores();
        mostrarToast('Proveedor actualizado', 'info');
    });
}

function mostrarProveedores() {
    var tabla = document.getElementById('tablaProveedores');
    if (!tabla) return;
    
    var html = '';
    
    if (proveedores.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No hay proveedores registrados</td></tr>';
        return;
    }
    
    for (var i = 0; i < proveedores.length; i++) {
        var p = proveedores[i];
        html += '<tr>';
        html += '<td>' + p.nombre + '</td>';
        html += '<td>' + (p.telefono || '-') + '</td>';
        html += '<td>' + (p.direccion || '-') + '</td>';
        html += '<td>' + (p.email || '-') + '</td>';
        html += '<td>';
        html += '<button class="btn-editar" onclick="editarProveedor(\'' + p.id + '\')">Editar</button>';
        html += '<button class="btn-eliminar" onclick="eliminarProveedor(\'' + p.id + '\')">Eliminar</button>';
        html += '</td>';
        html += '</tr>';
    }
    tabla.innerHTML = html;
}

function agregarBotonExportarProveedores() {
    var contenedor = document.querySelector('.contenido-principal');
    if (!contenedor) return;
    
    var botonExistente = document.getElementById('btnExportarProveedores');
    if (botonExistente) return;
    
    var boton = document.createElement('button');
    boton.id = 'btnExportarProveedores';
    boton.innerText = 'Exportar Proveedores a Excel';
    boton.style.cssText = 'margin-top: 15px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
    
    boton.onclick = function() {
        if (proveedores.length === 0) {
            mostrarToast('No hay proveedores para exportar', 'error');
            return;
        }
        
        var csvContent = 'ID;Nombre;Telefono;Direccion;Email;Fecha\n';
        for (var i = 0; i < proveedores.length; i++) {
            var p = proveedores[i];
            csvContent += p.id + ';' + p.nombre + ';' + (p.telefono || '') + ';' + (p.direccion || '') + ';' + (p.email || '') + ';' + (p.fecha || '') + '\n';
        }
        
        var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'proveedores_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarToast('Proveedores exportados correctamente', 'success');
    };
    contenedor.appendChild(boton);
}

// ============================================
// MODAL DE EDICION PARA PROVEEDORES
// ============================================

function mostrarModalEdicionProveedor(proveedor, callback) {
    var overlay = document.createElement('div');
    overlay.id = 'modalOverlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;';
    
    var modal = document.createElement('div');
    modal.style.cssText = 'background:white; border-radius:15px; padding:30px; max-width:450px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.3);';
    
    modal.innerHTML = `
        <h2 style="margin-bottom:20px; color:#0f172a; text-align:center;">Editar Proveedor</h2>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Nombre</label>
            <input type="text" id="modalNombre" value="${proveedor.nombre}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Telefono</label>
            <input type="text" id="modalTelefono" value="${proveedor.telefono || ''}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Direccion</label>
            <input type="text" id="modalDireccion" value="${proveedor.direccion || ''}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
        </div>
        
        <div style="margin-bottom:20px;">
            <label style="display:block; font-weight:500; margin-bottom:5px; color:#334155;">Email</label>
            <input type="email" id="modalEmail" value="${proveedor.email || ''}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px;">
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
        var telefono = document.getElementById('modalTelefono').value.trim();
        var direccion = document.getElementById('modalDireccion').value.trim();
        var email = document.getElementById('modalEmail').value.trim();
        
        if (nombre === '') {
            mostrarToast('El nombre es obligatorio', 'error');
            return;
        }
        
        document.body.removeChild(overlay);
        callback({
            nombre: nombre,
            telefono: telefono,
            direccion: direccion,
            email: email
        });
    };
    
    overlay.onclick = function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };
}

// ============================================
// MODAL DE CONFIRMACION (reutilizado)
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