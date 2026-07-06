let productos =
JSON.parse(
    localStorage.getItem("productos")
) || [];

let carrito = [];

let productoActual = null;

const busqueda =
document.getElementById("busqueda");

busqueda.addEventListener(
    "input",
    buscarProducto
);

function buscarProducto(){

    const texto =
    busqueda.value
    .toLowerCase()
    .trim();

    const info =
    document.getElementById(
        "infoProducto"
    );

    if(texto === ""){

        info.innerHTML = "";
        productoActual = null;

        return;
    }

    const encontrado =
    productos.find(producto =>
        producto.nombre
        .toLowerCase()
        .includes(texto)
    );

    if(!encontrado){

        info.innerHTML = `
            <p style="color:#dc2626; font-weight:bold; margin-top: 10px;">
                Producto no encontrado
            </p>
        `;

        productoActual = null;

        return;
    }

    productoActual = encontrado;

    info.innerHTML = `
        <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            <h3 style="color: #0f172a; font-size: 1.1rem; margin-bottom: 5px;">
                ${encontrado.nombre}
            </h3>
            <p style="font-size: 20px; font-weight: bold; color: #10b981;">
                Precio: $${encontrado.precio}
            </p>
            <p style="color: #64748b; font-size: 0.9rem;">
                Stock disponible: ${encontrado.stock} u.
            </p>
        </div>
    `;
}

function agregarAlCarrito(){

    const cantidadInput =
    document.getElementById("cantidad");

    const cantidad =
    parseInt(cantidadInput.value);

    if(!productoActual){

        alert(
        "Busque y seleccione un producto"
        );

        return;
    }

    if(isNaN(cantidad) || cantidad <= 0){

        alert(
        "Ingrese una cantidad válida"
        );

        return;
    }

    if(cantidad > productoActual.stock){

        alert(
        "Stock insuficiente"
        );

        return;
    }

    const subtotal =
    productoActual.precio * cantidad;

    carrito.push({
        producto: productoActual,
        cantidad,
        subtotal
    });

    actualizarCarrito();

    cantidadInput.value = "";
    busqueda.value = "";
    document.getElementById("infoProducto").innerHTML = "";
    productoActual = null;
}

function actualizarCarrito(){

    const tabla =
    document.getElementById(
    "tablaCarrito"
    );

    let html = "";

    carrito.forEach(item => {

        html += `
        <tr>
            <td>
                ${item.producto.nombre}
            </td>
            <td>
                ${item.cantidad}
            </td>
            <td>
                $${item.producto.precio}
            </td>
            <td>
                $${item.subtotal}
            </td>
        </tr>
        `;
    });

    tabla.innerHTML = html;

    const total =
    carrito.reduce(
        (suma,item)=>
        suma + item.subtotal,
        0
    );

    document
    .getElementById("totalGeneral")
    .innerText = "Total: $" + total;
}

function finalizarVenta(){

    if(carrito.length === 0){

        alert(
        "No hay productos en el carrito"
        );

        return;
    }

    let ventas =
    JSON.parse(
        localStorage.getItem(
            "ventas"
        )
    ) || [];

    const total =
    carrito.reduce(
        (suma,item)=>
        suma + item.subtotal,
        0
    );

    const venta = {
        fecha:
        new Date()
        .toLocaleString(),
        productos:
        carrito.map(item=>({
            nombre:
            item.producto.nombre,
            cantidad:
            item.cantidad,
            subtotal:
            item.subtotal
        })),
        total
    };

    ventas.push(venta);

    carrito.forEach(item=>{
        const producto =
        productos.find(p=>
            p.nombre ===
            item.producto.nombre
        );
        if(producto){
            producto.stock -=
            item.cantidad;
        }
    });

    localStorage.setItem(
        "productos",
        JSON.stringify(productos)
    );

    localStorage.setItem(
        "ventas",
        JSON.stringify(ventas)
    );

    carrito = [];
    actualizarCarrito();
    busqueda.value = "";

    alert("Venta registrada correctamente");

    productos = JSON.parse(localStorage.getItem("productos")) || [];
}