const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

document.addEventListener("DOMContentLoaded", () => {
    const tabla = document.getElementById("tablaHistorial");

    if(ventas.length === 0){
        tabla.innerHTML = `<tr><td colspan="3">No hay ventas registradas</td></tr>`;
    } else {
        ventas.slice().reverse().forEach(venta => {
            let productosTexto = "";
            venta.productos.forEach(p => {
                productosTexto += `${p.nombre} x${p.cantidad}<br>`;
            });

            tabla.innerHTML += `
            <tr>
                <td>${venta.fecha}</td>
                <td>${productosTexto}</td>
                <td>$${venta.total}</td>
            </tr>
            `;
        });
        agregarBotonExportarVentas();
    }
});

// Funcion para exportar historial de facturacion
function agregarBotonExportarVentas() {
    const contenedor = document.querySelector(".contenido-principal");
    const boton = document.createElement("button");
    boton.innerText = "Exportar Ventas a Excel/Access";
    boton.style.cssText = "margin-top: 15px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;";
    
    boton.onclick = () => {
        let csvContent = "\uFEFFid;fecha;productos;total\n";
        ventas.forEach((v, index) => {
            let prodLista = v.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(" - ");
            csvContent += `${index + 1};${v.fecha};${prodLista};${v.total}\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "historial_ventas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    contenedor.appendChild(boton);
}