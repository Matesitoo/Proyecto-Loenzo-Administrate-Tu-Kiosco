// caja.js - Gestion de caja con formateo en tiempo real

var caja = JSON.parse(localStorage.getItem('caja')) || [];
var ventas = JSON.parse(localStorage.getItem('ventas')) || [];

document.addEventListener('DOMContentLoaded', function() {
    mostrarEstadoCaja();
    mostrarMovimientosCaja();
    actualizarResumenCaja();
    configurarFormateoMontos();
});

// ============================================
// FUNCIONES DE FORMATEO EN VIVO
// ============================================

function formatearMontoEnVivo(valor) {
    // Si está vacío, devolver vacío
    if (!valor) return '';
    
    // Limpiar: solo dígitos y coma
    var limpio = valor.replace(/[^\d,]/g, '');
    
    // Separar enteros y decimales
    var partes = limpio.split(',');
    var enteros = partes[0] || '';
    var decimales = partes[1] || '';
    
    // Limitar decimales a 2
    if (decimales.length > 2) {
        decimales = decimales.slice(0, 2);
    }
    
    // Si no hay decimales, solo formatear enteros
    if (decimales.length === 0) {
        // Formatear enteros con puntos de miles
        var enterosFormateados = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return enterosFormateados;
    }
    
    // Formatear enteros con puntos de miles
    var enterosFormateados = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return enterosFormateados + ',' + decimales;
}

function formatearNumero(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) return '';
    var partes = valor.toFixed(2).split('.');
    var entero = partes[0];
    var decimal = partes[1];
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return entero + ',' + decimal;
}

function formatearNumeroSinDecimales(valor) {
    if (isNaN(valor) || valor === null || valor === undefined) return '';
    var entero = Math.round(valor).toString();
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return entero;
}

function desformatearNumero(valorStr) {
    if (!valorStr) return 0;
    var limpio = valorStr.replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(limpio) || 0;
}

function configurarFormateoMontos() {
    var montoInicial = document.getElementById('montoInicial');
    var montoFinal = document.getElementById('montoFinal');
    
    if (montoInicial) {
        // Al escribir, formatear en vivo
        montoInicial.addEventListener('input', function(e) {
            var cursorPos = this.selectionStart;
            var valorAnterior = this.value;
            var nuevoValor = formatearMontoEnVivo(this.value);
            
            // Si el valor cambió, actualizar y restaurar posición del cursor
            if (nuevoValor !== valorAnterior) {
                this.value = nuevoValor;
                // Ajustar cursor
                var diff = nuevoValor.length - valorAnterior.length;
                this.setSelectionRange(cursorPos + diff, cursorPos + diff);
            }
        });
        
        montoInicial.addEventListener('blur', function() {
            var valor = desformatearNumero(this.value);
            if (valor > 0) {
                this.value = formatearNumero(valor);
            } else {
                this.value = '';
            }
        });
        
        montoInicial.addEventListener('focus', function() {
            var valor = desformatearNumero(this.value);
            if (valor > 0) {
                // Mostrar sin formato para editar (solo dígitos y coma)
                var str = valor.toString().replace('.', ',');
                // Si es entero, agregar ,00
                if (!str.includes(',')) {
                    str += ',00';
                }
                this.value = str;
            } else {
                this.value = '';
            }
        });
        
        // Si ya tiene valor al cargar, formatearlo
        if (montoInicial.value) {
            var val = desformatearNumero(montoInicial.value);
            if (val > 0) montoInicial.value = formatearNumero(val);
        }
    }
    
    if (montoFinal) {
        montoFinal.addEventListener('input', function(e) {
            var cursorPos = this.selectionStart;
            var valorAnterior = this.value;
            var nuevoValor = formatearMontoEnVivo(this.value);
            
            if (nuevoValor !== valorAnterior) {
                this.value = nuevoValor;
                var diff = nuevoValor.length - valorAnterior.length;
                this.setSelectionRange(cursorPos + diff, cursorPos + diff);
            }
        });
        
        montoFinal.addEventListener('blur', function() {
            var valor = desformatearNumero(this.value);
            if (valor > 0) {
                this.value = formatearNumero(valor);
            } else {
                this.value = '';
            }
        });
        
        montoFinal.addEventListener('focus', function() {
            var valor = desformatearNumero(this.value);
            if (valor > 0) {
                var str = valor.toString().replace('.', ',');
                if (!str.includes(',')) {
                    str += ',00';
                }
                this.value = str;
            } else {
                this.value = '';
            }
        });
        
        if (montoFinal.value) {
            var val = desformatearNumero(montoFinal.value);
            if (val > 0) montoFinal.value = formatearNumero(val);
        }
    }
}

// ============================================
// FUNCIONES DE CAJA
// ============================================

function abrirCaja() {
    var input = document.getElementById('montoInicial');
    var montoInicial = desformatearNumero(input.value);
    
    if (isNaN(montoInicial) || montoInicial <= 0) {
        mostrarToast('Ingrese un monto inicial valido (mayor a 0)', 'error');
        return;
    }
    
    // Verificar si ya hay una caja abierta
    var cajaAbierta = false;
    for (var i = 0; i < caja.length; i++) {
        if (caja[i].estado === 'abierta') {
            cajaAbierta = true;
            break;
        }
    }
    
    if (cajaAbierta) {
        mostrarToast('Ya hay una caja abierta', 'error');
        return;
    }
    
    var registro = {
        id: generarId(),
        fecha: new Date().toLocaleString(),
        tipo: 'apertura',
        monto: montoInicial,
        descripcion: 'Apertura de caja',
        estado: 'abierta',
        usuario: getUsuarioActual() ? getUsuarioActual().nombre_completo : 'Anonimo'
    };
    
    caja.push(registro);
    localStorage.setItem('caja', JSON.stringify(caja));
    
    input.value = '';
    mostrarEstadoCaja();
    mostrarMovimientosCaja();
    actualizarResumenCaja();
    mostrarToast('Caja abierta correctamente', 'success');
}

function cerrarCaja() {
    var input = document.getElementById('montoFinal');
    var montoFinal = desformatearNumero(input.value);
    
    if (isNaN(montoFinal) || montoFinal <= 0) {
        mostrarToast('Ingrese un monto final valido (mayor a 0)', 'error');
        return;
    }
    
    // Verificar si hay una caja abierta
    var cajaAbierta = false;
    var indiceApertura = -1;
    for (var i = 0; i < caja.length; i++) {
        if (caja[i].estado === 'abierta') {
            cajaAbierta = true;
            indiceApertura = i;
            break;
        }
    }
    
    if (!cajaAbierta) {
        mostrarToast('No hay una caja abierta', 'error');
        return;
    }
    
    // Calcular ventas del dia
    var hoy = new Date();
    var dia = hoy.getDate();
    var mes = hoy.getMonth() + 1;
    var anio = hoy.getFullYear();
    var fechaHoy = dia + '/' + mes + '/' + anio;
    
    var ventasHoy = 0;
    for (var i = 0; i < ventas.length; i++) {
        var fechaVenta = ventas[i].fecha.split(',')[0];
        if (fechaVenta === fechaHoy) {
            ventasHoy += ventas[i].total;
        }
    }
    
    var montoApertura = caja[indiceApertura].monto;
    var montoEsperado = montoApertura + ventasHoy;
    var diferencia = montoFinal - montoEsperado;
    
    var registro = {
        id: generarId(),
        fecha: new Date().toLocaleString(),
        tipo: 'cierre',
        monto: montoFinal,
        monto_esperado: montoEsperado,
        diferencia: diferencia,
        descripcion: 'Cierre de caja',
        estado: 'cerrada',
        usuario: getUsuarioActual() ? getUsuarioActual().nombre_completo : 'Anonimo'
    };
    
    caja.push(registro);
    // Marcar la apertura como cerrada
    caja[indiceApertura].estado = 'cerrada';
    
    localStorage.setItem('caja', JSON.stringify(caja));
    
    input.value = '';
    mostrarEstadoCaja();
    mostrarMovimientosCaja();
    actualizarResumenCaja();
    mostrarToast('Caja cerrada correctamente', 'success');
}

function mostrarEstadoCaja() {
    var estadoDiv = document.getElementById('estadoCaja');
    if (!estadoDiv) return;
    
    var cajaAbierta = false;
    var montoApertura = 0;
    for (var i = 0; i < caja.length; i++) {
        if (caja[i].estado === 'abierta') {
            cajaAbierta = true;
            montoApertura = caja[i].monto;
            break;
        }
    }
    
    if (cajaAbierta) {
        estadoDiv.innerHTML = `
            <div style="background:#d1fae5; padding:20px; border-radius:10px; border-left:4px solid #10b981;">
                <h3 style="color:#065f46;">✅ Caja abierta</h3>
                <p style="color:#065f46;">Monto inicial: $${formatearNumero(montoApertura)}</p>
                <p style="color:#065f46;">Abierta por: ${caja[caja.length-1].usuario}</p>
            </div>
        `;
        document.getElementById('accionesCaja').innerHTML = `
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                <div style="flex:1; min-width:200px;">
                    <label style="font-weight:500; color:#334155;">Monto final para cerrar:</label>
                    <input type="text" id="montoFinal" placeholder="Ej: 100.000,00" style="width:100%; margin-top:5px; padding:10px; border:2px solid #e2e8f0; border-radius:8px; font-size:1rem;">
                </div>
                <button onclick="cerrarCaja()" style="background:#dc2626; align-self:flex-end;">Cerrar Caja</button>
            </div>
        `;
        configurarFormateoMontos();
    } else {
        estadoDiv.innerHTML = `
            <div style="background:#fef3c7; padding:20px; border-radius:10px; border-left:4px solid #f59e0b;">
                <h3 style="color:#92400e;">🔒 Caja cerrada</h3>
                <p style="color:#92400e;">No hay una caja abierta actualmente</p>
            </div>
        `;
        document.getElementById('accionesCaja').innerHTML = `
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                <div style="flex:1; min-width:200px;">
                    <label style="font-weight:500; color:#334155;">Monto inicial para abrir:</label>
                    <input type="text" id="montoInicial" placeholder="Ej: 100.000,00" style="width:100%; margin-top:5px; padding:10px; border:2px solid #e2e8f0; border-radius:8px; font-size:1rem;">
                </div>
                <button onclick="abrirCaja()" style="background:#10b981; align-self:flex-end;">Abrir Caja</button>
            </div>
        `;
        configurarFormateoMontos();
    }
}

function mostrarMovimientosCaja() {
    var tabla = document.getElementById('tablaMovimientosCaja');
    if (!tabla) return;
    
    if (caja.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No hay movimientos registrados</td></tr>';
        return;
    }
    
    var html = '';
    for (var i = caja.length - 1; i >= 0; i--) {
        var m = caja[i];
        var tipoDisplay = m.tipo === 'apertura' ? 'Apertura' : 'Cierre';
        var color = m.tipo === 'apertura' ? '#10b981' : '#dc2626';
        var montoFormateado = formatearNumero(m.monto);
        var diferenciaFormateada = (m.diferencia !== undefined) ? formatearNumero(m.diferencia) : '-';
        var colorDiferencia = (m.diferencia !== undefined) ? (m.diferencia >= 0 ? '#10b981' : '#dc2626') : '#94a3b8';
        
        html += '<tr>';
        html += '<td>' + m.fecha + '</td>';
        html += '<td style="color:' + color + '; font-weight:bold;">' + tipoDisplay + '</td>';
        html += '<td>$' + montoFormateado + '</td>';
        html += '<td style="color:' + colorDiferencia + '; font-weight:bold;">' + diferenciaFormateada + '</td>';
        html += '<td>' + m.usuario + '</td>';
        html += '</tr>';
    }
    tabla.innerHTML = html;
}

function actualizarResumenCaja() {
    var hoy = new Date();
    var dia = hoy.getDate();
    var mes = hoy.getMonth() + 1;
    var anio = hoy.getFullYear();
    var fechaHoy = dia + '/' + mes + '/' + anio;
    
    var ventasHoy = 0;
    var cantidadVentas = 0;
    for (var i = 0; i < ventas.length; i++) {
        var fechaVenta = ventas[i].fecha.split(',')[0];
        if (fechaVenta === fechaHoy) {
            ventasHoy += ventas[i].total;
            cantidadVentas++;
        }
    }
    
    var resumenDiv = document.getElementById('resumenCaja');
    if (!resumenDiv) return;
    
    resumenDiv.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px;">
            <div class="card" style="padding:15px;">
                <h3>Ventas hoy</h3>
                <p>${cantidadVentas}</p>
            </div>
            <div class="card" style="padding:15px;">
                <h3>Total facturado</h3>
                <p>$${formatearNumero(ventasHoy)}</p>
            </div>
        </div>
    `;
}