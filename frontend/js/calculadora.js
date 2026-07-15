// calculadora.js - Calculadora con historial y soporte de teclado
// Modo: Calculadora de negocio (como celular)

var historial = JSON.parse(localStorage.getItem('historialCalculadora')) || [];
var ultimoResultado = null;
var expresion = '';
var operadorPendiente = null;
var numeroActual = '0';
var reiniciarDisplay = false;

document.addEventListener('DOMContentLoaded', function() {
    mostrarHistorial();
    configurarTeclado();
    actualizarDisplay();
});

function actualizarDisplay() {
    var display = document.getElementById('calcDisplay');
    display.value = numeroActual;
}

function agregarNumero(num) {
    if (reiniciarDisplay) {
        numeroActual = '';
        reiniciarDisplay = false;
    }
    
    if (num === '.' && numeroActual.includes('.')) {
        return;
    }
    
    if (numeroActual === '0' && num !== '.') {
        numeroActual = num;
    } else {
        numeroActual += num;
    }
    
    actualizarDisplay();
}

function agregarOperador(op) {
    if (operadorPendiente !== null) {
        calcularResultadoInterno();
    }
    
    operadorPendiente = op;
    expresion = numeroActual + ' ' + op + ' ';
    reiniciarDisplay = true;
}

function calcularResultadoInterno() {
    if (operadorPendiente === null) {
        return;
    }
    
    var num1 = parseFloat(expresion.split(' ')[0]);
    var num2 = parseFloat(numeroActual);
    var resultado = 0;
    
    switch (operadorPendiente) {
        case '+':
            resultado = num1 + num2;
            break;
        case '-':
            resultado = num1 - num2;
            break;
        case '*':
            resultado = num1 * num2;
            break;
        case '/':
            if (num2 === 0) {
                numeroActual = 'Error';
                actualizarDisplay();
                setTimeout(function() { 
                    numeroActual = '0';
                    actualizarDisplay();
                }, 1500);
                operadorPendiente = null;
                expresion = '';
                return;
            }
            resultado = num1 / num2;
            break;
    }
    
    resultado = Math.round(resultado * 100) / 100;
    var operacionCompleta = expresion + num2 + ' = ' + resultado;
    agregarAlHistorial(operacionCompleta, resultado);
    
    numeroActual = resultado.toString();
    operadorPendiente = null;
    expresion = '';
    ultimoResultado = resultado;
    reiniciarDisplay = true;
    actualizarDisplay();
}

function calcularResultado() {
    if (operadorPendiente !== null) {
        calcularResultadoInterno();
    } else {
        var valor = parseFloat(numeroActual);
        if (!isNaN(valor) && isFinite(valor)) {
            numeroActual = valor.toString();
            actualizarDisplay();
        }
    }
}

function calcularPorcentaje() {
    if (operadorPendiente !== null) {
        var num1 = parseFloat(expresion.split(' ')[0]);
        var porcentaje = parseFloat(numeroActual);
        var resultado = (num1 * porcentaje) / 100;
        numeroActual = resultado.toString();
        actualizarDisplay();
    } else {
        var valor = parseFloat(numeroActual);
        if (!isNaN(valor) && isFinite(valor)) {
            var resultado = valor / 100;
            numeroActual = resultado.toString();
            actualizarDisplay();
        }
    }
}

function limpiarDisplay() {
    numeroActual = '0';
    operadorPendiente = null;
    expresion = '';
    reiniciarDisplay = false;
    actualizarDisplay();
}

function borrarUltimo() {
    if (numeroActual === 'Error') {
        numeroActual = '0';
        actualizarDisplay();
        return;
    }
    if (numeroActual.length > 1) {
        numeroActual = numeroActual.slice(0, -1);
    } else {
        numeroActual = '0';
    }
    actualizarDisplay();
}

function agregarAlHistorial(operacion, resultado) {
    var fecha = new Date().toLocaleString();
    historial.unshift({
        operacion: operacion,
        resultado: resultado,
        fecha: fecha
    });
    
    if (historial.length > 50) {
        historial = historial.slice(0, 50);
    }
    
    localStorage.setItem('historialCalculadora', JSON.stringify(historial));
    mostrarHistorial();
}

function mostrarHistorial() {
    var lista = document.getElementById('historialLista');
    if (!lista) return;
    
    if (historial.length === 0) {
        lista.innerHTML = '<li class="historial-vacio">No hay calculos realizados</li>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < historial.length; i++) {
        var item = historial[i];
        html += '<li>';
        html += '<span class="operacion">' + item.operacion + '</span>';
        html += '<span class="resultado">' + item.resultado + '</span>';
        html += '</li>';
    }
    lista.innerHTML = html;
}

function limpiarHistorial() {
    mostrarModalConfirmacion('¿Esta seguro de borrar todo el historial de calculos?', function() {
        historial = [];
        localStorage.setItem('historialCalculadora', JSON.stringify(historial));
        mostrarHistorial();
        mostrarToast('Historial borrado', 'warning');
    });
}

function usarUltimoResultado() {
    if (ultimoResultado !== null) {
        numeroActual = ultimoResultado.toString();
        reiniciarDisplay = true;
        actualizarDisplay();
    } else {
        mostrarToast('No hay resultados previos', 'warning');
    }
}

// ============================================
// EXPORTAR HISTORIAL (llamado desde el HTML)
// ============================================

function exportarHistorial() {
    if (historial.length === 0) {
        mostrarToast('No hay calculos para exportar', 'error');
        return;
    }
    
    var fechaActual = new Date().toISOString().split('T')[0];
    var csvContent = '\uFEFF';
    csvContent += '=== HISTORIAL DE CALCULOS ===\n';
    csvContent += 'Fecha;Operacion;Resultado\n';
    
    for (var i = 0; i < historial.length; i++) {
        var item = historial[i];
        csvContent += item.fecha + ';' + item.operacion + ';' + item.resultado + '\n';
    }
    
    var totalCalculos = historial.length;
    csvContent += '\n=== RESUMEN ===\n';
    csvContent += 'Total de calculos;' + totalCalculos + '\n';
    
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'historial_calculadora_' + fechaActual + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast('Historial exportado correctamente', 'success');
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
            <button id="modalConfirmAceptar" style="padding:10px 25px; background:#dc2626; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;">Borrar</button>
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

// ============================================
// SOPORTE PARA TECLADO
// ============================================

function configurarTeclado() {
    document.addEventListener('keydown', function(event) {
        var key = event.key;
        
        if (key >= '0' && key <= '9') {
            event.preventDefault();
            agregarNumero(key);
            return;
        }
        
        if (key === '+') {
            event.preventDefault();
            agregarOperador('+');
            return;
        }
        if (key === '-') {
            event.preventDefault();
            agregarOperador('-');
            return;
        }
        if (key === '*') {
            event.preventDefault();
            agregarOperador('*');
            return;
        }
        if (key === '/') {
            event.preventDefault();
            agregarOperador('/');
            return;
        }
        
        if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calcularResultado();
            return;
        }
        
        if (key === 'Backspace') {
            event.preventDefault();
            borrarUltimo();
            return;
        }
        
        if (key === 'Escape' || key === 'Delete') {
            event.preventDefault();
            limpiarDisplay();
            return;
        }
        
        if (key === '.') {
            event.preventDefault();
            agregarNumero('.');
            return;
        }
        
        if (key === '%') {
            event.preventDefault();
            calcularPorcentaje();
            return;
        }
    });
}