const productos =
JSON.parse(
    localStorage.getItem("productos")
) || [];

const ventas =
JSON.parse(
    localStorage.getItem("ventas")
) || [];

document
.getElementById("cantProductos")
.innerText =
productos.length;

document
.getElementById("cantVentas")
.innerText =
ventas.length;

const ingresos =
ventas.reduce(
    (total, venta) =>
        total + venta.total,
    0
);

document
.getElementById("ingresos")
.innerText =
"$" + Math.round(ingresos).toLocaleString('es-AR');

const stockBajo =
productos.filter(
    producto =>
    producto.stock <= 5
).length;

document
.getElementById("stockBajo")
.innerText =
stockBajo;

const listaVentas =
document.getElementById(
    "ultimasVentas"
);

if(ventas.length === 0){
    listaVentas.innerHTML = `
        <li>
            No hay ventas registradas
        </li>
    `;
}
else{
    listaVentas.innerHTML = "";
    ventas
    .slice()
    .reverse()
    .slice(0, 5)
    .forEach(venta => {
        listaVentas.innerHTML += `
            <li>
                <strong>${venta.fecha}</strong> - Total: $${venta.total}
            </li>
        `;
    });
}