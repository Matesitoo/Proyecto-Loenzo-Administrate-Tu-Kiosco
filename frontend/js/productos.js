let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Al cargar la pagina mostramos los productos ya existentes
document.addEventListener("DOMContentLoaded", () => {
    mostrarProductos();
    agregarBotonExportar();
});

function guardarProductos(){
    localStorage.setItem("productos", JSON.stringify(productos));
}

function agregarProducto(){
    const nombre = document.getElementById("nombre").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const stock = parseInt(document.getElementById("stock").value);

    if(nombre === "" || isNaN(precio) || isNaN(stock)){
        alert("Complete todos los campos");
        return;
    }

    productos.push({ nombre, precio, stock });
    guardarProductos();
    mostrarProductos();
    limpiarFormulario();
}

function limpiarFormulario(){
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
}

function eliminarProducto(indice){
    if(confirm("¿Seguro que desea eliminar este producto?")){
        productos.splice(indice, 1);
        guardarProductos();
        mostrarProductos();
    }
}

function editarProducto(indice){
    const producto = productos[indice];
    
    const nombre = prompt("Nuevo nombre:", producto.nombre);
    if(nombre === null || nombre.trim() === "") return;

    const precio = prompt("Nuevo precio:", producto.precio);
    if(precio === null || isNaN(parseFloat(precio))) return;

    const stock = prompt("Nuevo stock:", producto.stock);
    if(stock === null || isNaN(parseInt(stock))) return;

    producto.nombre = nombre.trim();
    producto.precio = parseFloat(precio);
    producto.stock = parseInt(stock);

    guardarProductos();
    mostrarProductos();
}

function mostrarProductos(){
    const tabla = document.getElementById("tablaProductos");
    let html = "";

    productos.forEach((producto, indice)=>{
        html += `
        <tr>
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td style="color: ${producto.stock <= 5 ? '#dc2626' : '#16a34a'}; font-weight:bold;">
                ${producto.stock}
            </td>
            <td>
                <button class="btn-editar" onclick="editarProducto(${indice})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${indice})">Eliminar</button>
            </td>
        </tr>
        `;
    });
    tabla.innerHTML = html;
}

// Funcion para generar el reporte para Excel/Access
function agregarBotonExportar() {
    const contenedor = document.querySelector(".contenido-principal");
    const boton = document.createElement("button");
    boton.innerText = "Exportar Inventario a Excel/Access";
    boton.style.cssText = "margin-top: 15px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;";
    
    boton.onclick = () => {
        if(productos.length === 0) return alert("No hay productos para exportar");
        
        // Estructura del CSV con BOM para que reconozca eñes y acentos en Excel
        let csvContent = "\uFEFFid;nombre;precio;stock\n";
        productos.forEach((p, index) => {
            csvContent += `${index + 1};${p.nombre};${p.precio};${p.stock}\n`;
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "inventario_kiosco.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    contenedor.appendChild(boton);
}