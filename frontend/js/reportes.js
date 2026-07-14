// reportes.js - Reportes y estadisticas

var productos = JSON.parse(localStorage.getItem('productos')) || [];
var ventas = JSON.parse(localStorage.getItem('ventas')) || [];

document.addEventListener('DOMContentLoaded', function() {
    cargarGraficos();
    mostrarResumen();
    agregarBotonExportarReportes();
});

function cargarGraficos() {
    // Grafico de ventas por dia
    var ctxVentas = document.getElementById('graficoVentas');
    if (!ctxVentas) return;
    
    ctxVentas = ctxVentas.getContext('2d');
    var ventasPorDia = {};
    
    for (var i = 0; i < ventas.length; i++) {
        var v = ventas[i];
        var fecha = v.fecha.split(' ')[0];
        if (ventasPorDia[fecha]) {
            ventasPorDia[fecha] += v.total;
        } else {
            ventasPorDia[fecha] = v.total;
        }
    }
    
    var fechas = Object.keys(ventasPorDia).sort();
    var montos = [];
    for (var i = 0; i < fechas.length; i++) {
        montos.push(ventasPorDia[fechas[i]]);
    }
    
    new Chart(ctxVentas, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                label: 'Ventas por dia',
                data: montos,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#1e293b'
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) { return formatearMoneda(value); }
                    }
                }
            }
        }
    });
    
    // Grafico de productos mas vendidos
    var ctxProductos = document.getElementById('graficoProductos');
    if (!ctxProductos) return;
    
    ctxProductos = ctxProductos.getContext('2d');
    var productosVendidos = {};
    
    for (var i = 0; i < ventas.length; i++) {
        var v = ventas[i];
        for (var j = 0; j < v.productos.length; j++) {
            var p = v.productos[j];
            if (productosVendidos[p.nombre]) {
                productosVendidos[p.nombre] += p.cantidad;
            } else {
                productosVendidos[p.nombre] = p.cantidad;
            }
        }
    }
    
    var nombres = Object.keys(productosVendidos);
    var cantidades = [];
    for (var i = 0; i < nombres.length; i++) {
        cantidades.push(productosVendidos[nombres[i]]);
    }
    
    var items = [];
    for (var i = 0; i < nombres.length; i++) {
        items.push({ nombre: nombres[i], cantidad: cantidades[i] });
    }
    
    items.sort(function(a, b) { return b.cantidad - a.cantidad; });
    items = items.slice(0, 5);
    
    var topNombres = [];
    var topCantidades = [];
    for (var i = 0; i < items.length; i++) {
        topNombres.push(items[i].nombre);
        topCantidades.push(items[i].cantidad);
    }
    
    var colores = ['#2563eb', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6'];
    
    new Chart(ctxProductos, {
        type: 'bar',
        data: {
            labels: topNombres,
            datasets: [{
                label: 'Unidades vendidas',
                data: topCantidades,
                backgroundColor: colores
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#1e293b'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function mostrarResumen() {
    var totalVentas = ventas.length;
    var ingresos = 0;
    var stockTotal = 0;
    
    for (var i = 0; i < ventas.length; i++) {
        ingresos += ventas[i].total;
    }
    
    for (var i = 0; i < productos.length; i++) {
        stockTotal += productos[i].stock;
    }
    
    document.getElementById('totalVentasReporte').innerText = totalVentas;
    document.getElementById('ingresosReporte').innerText = formatearMoneda(ingresos);
    document.getElementById('stockReporte').innerText = stockTotal;
}

function agregarBotonExportarReportes() {
    var contenedor = document.querySelector('.contenido-principal');
    var botonExistente = document.getElementById('btnExportarReportes');
    if (botonExistente) return;
    
    var boton = document.createElement('button');
    boton.id = 'btnExportarReportes';
    boton.innerText = 'Exportar Reportes a Excel';
    boton.style.cssText = 'margin-top: 15px; padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;';
    
    boton.onclick = function() {
        if (ventas.length === 0 && productos.length === 0) {
            mostrarToast('No hay datos para exportar', 'error');
            return;
        }
        
        var fechaActual = new Date().toISOString().split('T')[0];
        var csvContent = '\uFEFF';
        
        // Resumen general
        csvContent += '=== RESUMEN GENERAL ===\n';
        csvContent += 'Total Ventas;' + ventas.length + '\n';
        
        var ingresos = 0;
        for (var i = 0; i < ventas.length; i++) {
            ingresos += ventas[i].total;
        }
        csvContent += 'Ingresos Totales;' + ingresos + '\n';
        
        var stockTotal = 0;
        for (var i = 0; i < productos.length; i++) {
            stockTotal += productos[i].stock;
        }
        csvContent += 'Productos en Stock;' + stockTotal + '\n';
        csvContent += 'Total Productos;' + productos.length + '\n\n';
        
        // Productos mas vendidos
        var productosVendidos = {};
        for (var i = 0; i < ventas.length; i++) {
            var v = ventas[i];
            for (var j = 0; j < v.productos.length; j++) {
                var p = v.productos[j];
                if (productosVendidos[p.nombre]) {
                    productosVendidos[p.nombre] += p.cantidad;
                } else {
                    productosVendidos[p.nombre] = p.cantidad;
                }
            }
        }
        
        csvContent += '=== PRODUCTOS MAS VENDIDOS ===\n';
        csvContent += 'Producto;Unidades Vendidas\n';
        
        var items = [];
        var nombres = Object.keys(productosVendidos);
        for (var i = 0; i < nombres.length; i++) {
            items.push({ nombre: nombres[i], cantidad: productosVendidos[nombres[i]] });
        }
        items.sort(function(a, b) { return b.cantidad - a.cantidad; });
        
        for (var i = 0; i < items.length; i++) {
            csvContent += items[i].nombre + ';' + items[i].cantidad + '\n';
        }
        
        csvContent += '\n';
        
        // Ventas por dia (si hay ventas)
        if (ventas.length > 0) {
            var ventasPorDia = {};
            for (var i = 0; i < ventas.length; i++) {
                var v = ventas[i];
                var fecha = v.fecha.split(' ')[0];
                if (ventasPorDia[fecha]) {
                    ventasPorDia[fecha] += v.total;
                } else {
                    ventasPorDia[fecha] = v.total;
                }
            }
            
            csvContent += '=== VENTAS POR DIA ===\n';
            csvContent += 'Fecha;Monto\n';
            
            var fechas = Object.keys(ventasPorDia).sort();
            for (var i = 0; i < fechas.length; i++) {
                csvContent += fechas[i] + ';' + ventasPorDia[fechas[i]] + '\n';
            }
        }
        
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'reportes_' + fechaActual + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        mostrarToast('Reportes exportados correctamente', 'success');
    };
    contenedor.appendChild(boton);
}