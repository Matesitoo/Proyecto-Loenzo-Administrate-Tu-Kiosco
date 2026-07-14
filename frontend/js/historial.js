// historial.js - Historial de ventas con filtros

var ventas = JSON.parse(localStorage.getItem('ventas')) || [];

document.addEventListener('DOMContentLoaded', function() {
    mostrarHistorial();
    agregarFiltrosFecha();
    agregarBotonExportar();
});

function mostrarHistorial(fechaInicio, fechaFin) {
    var tabla = document.getElementById('tablaHistorial');
    var ventasFiltradas = ventas;
    
    if (fechaInicio || fechaFin) {
        ventasFiltradas = [];
        for (var i = 0; i < ventas.length; i++) {
            var venta = ventas[i];
            var fechaVenta = new Date(venta.fecha);
            if (fechaInicio && fechaVenta < new Date(fechaInicio)) continue;
            if (fechaFin && fechaVenta > new Date(fechaFin + 'T23:59:59')) continue;
            ventasFiltradas.push(venta);
        }
    }
    
    if (ventasFiltradas.length === 0) {
        tabla.innerHTML = '<tr><td colspan="4">No hay ventas registradas en este periodo</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = ventasFiltradas.length - 1; i >= 0; i--) {
        var venta = ventasFiltradas[i];
        var productosTexto = '';
        for (var j = 0; j < venta.productos.length; j++) {
            var p = venta.productos[j];
            productosTexto += p.nombre + ' x' + p.cantidad + '<br>';
        }
        
        html += `
        <tr>
            <td>${venta.fecha}</td>
            <td>${venta.usuario || 'Anonimo'}</td>
            <td>${productosTexto}</td>
            <td>${formatearMoneda(venta.total)}</td>
        </tr>
        `;
    }
    
    tabla.innerHTML = html;
    
    var totalVentas = ventasFiltradas.length;
    var montoTotal = 0;
    
    for (var i = 0; i < ventasFiltradas.length; i++) {
        montoTotal += ventasFiltradas[i].total;
    }
    
    var resumenDiv = document.getElementById('resumenHistorial');
    if (!resumenDiv) {
        resumenDiv = document.createElement('div');
        resumenDiv.id = 'resumenHistorial';
        document.querySelector('.contenido-principal').appendChild(resumenDiv);
    }
    
    resumenDiv.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-top:20px;">
            <div class="card" style="padding:15px;">
                <h3>Total Ventas</h3>
                <p>${totalVentas}</p>
            </div>
            <div class="card" style="padding:15px;">
                <h3>Monto Total</h3>
                <p>${formatearMoneda(montoTotal)}</p>
            </div>
        </div>
    `;
}

function agregarFiltrosFecha() {
    if (document.getElementById('filtrosFecha')) return;
    
    var contenedor = document.querySelector('.contenido-principal');
    var filtrosDiv = document.createElement('div');
    filtrosDiv.id = 'filtrosFecha';
    filtrosDiv.className = 'filtros-fecha';
    filtrosDiv.innerHTML = `
        <label>Desde:</label>
        <input type="date" id="fechaInicio">
        <label>Hasta:</label>
        <input type="date" id="fechaFin">
        <button onclick="aplicarFiltros()">Filtrar</button>
        <button onclick="limpiarFiltros()" style="background:#64748b;">Limpiar</button>
    `;
    contenedor.insertBefore(filtrosDiv, document.querySelector('table'));
}

function aplicarFiltros() {
    var fechaInicio = document.getElementById('fechaInicio').value;
    var fechaFin = document.getElementById('fechaFin').value;
    mostrarHistorial(fechaInicio, fechaFin);
    mostrarToast('Filtros aplicados', 'info');
}

function limpiarFiltros() {
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    mostrarHistorial();
    mostrarToast('Filtros limpiados', 'info');
}

function agregarBotonExportar() {
    var contenedor = document.querySelector('.contenido-principal');
    var botonExistente = document.getElementById('btnExportarHistorial');
    if (botonExistente) return;
    
    var boton = document.createElement('button');
    boton.id = 'btnExportarHistorial';
    boton.innerText = 'Exportar Historial a Excel';
    boton.style.cssText = 'margin-top: 15px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
    
    boton.onclick = function() {
        if (ventas.length === 0) {
            mostrarToast('No hay ventas para exportar', 'error');
            return;
        }
        
        var csvContent = 'ID;Fecha;Vendedor;Productos;Total;Metodo Pago\n';
        for (var i = 0; i < ventas.length; i++) {
            var v = ventas[i];
            var prodLista = '';
            for (var j = 0; j < v.productos.length; j++) {
                var p = v.productos[j];
                if (j > 0) prodLista += ' - ';
                prodLista += p.nombre + ' (x' + p.cantidad + ')';
            }
            csvContent += (i + 1) + ';' + v.fecha + ';' + (v.usuario || 'Anonimo') + ';' + prodLista + ';' + v.total + ';' + (v.metodo_pago || 'efectivo') + '\n';
        }
        
        var blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'historial_ventas_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarToast('Historial exportado correctamente', 'success');
    };
    contenedor.appendChild(boton);
}