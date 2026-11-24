
const productos = [
    {
        nombre: "Café",
        categoria: "otros",
        icono: "☕",
        descripcion: "Cultivo reconocido por su importancia en la agricultura colombiana."
    },
    {
        nombre: "Banano",
        categoria: "frutas",
        icono: "🍌",
        descripcion: "Fruta tropical cultivada en distintas regiones del país."
    },
    {
        nombre: "Mango",
        categoria: "frutas",
        icono: "🥭",
        descripcion: "Fruta tropical que cuenta con diversas variedades."
    },
    {
        nombre: "Aguacate",
        categoria: "frutas",
        icono: "🥑",
        descripcion: "Fruto utilizado tanto en el consumo nacional como en mercados de exportación."
    },
    {
        nombre: "Arroz",
        categoria: "cereales",
        icono: "🌾",
        descripcion: "Cereal fundamental en la alimentación de muchos hogares colombianos."
    },
    {
        nombre: "Maíz",
        categoria: "cereales",
        icono: "🌽",
        descripcion: "Cultivo utilizado en la alimentación humana y animal."
    },
    {
        nombre: "Piña",
        categoria: "frutas",
        icono: "🍍",
        descripcion: "Fruta tropical producida en diferentes zonas agrícolas."
    },
    {
        nombre: "Cacao",
        categoria: "otros",
        icono: "🍫",
        descripcion: "Cultivo utilizado como materia prima para elaborar chocolate."
    },
    {
        nombre: "Papa",
        categoria: "otros",
        icono: "🥔",
        descripcion: "Tubérculo importante para la alimentación y la economía rural."
    }
];

const contenedor = document.getElementById("catalogo-productos");
const buscador = document.getElementById("buscar-producto");
const filtro = document.getElementById("filtro-categoria");
const contador = document.getElementById("contador-productos");
const sinResultados = document.getElementById("sin-resultados");

function mostrarProductos() {
    const busqueda = buscador.value.trim().toLowerCase();
    const categoriaSeleccionada = filtro.value;

    const filtrados = productos.filter((producto) => {
        const coincideNombre = producto.nombre
            .toLowerCase()
            .includes(busqueda);

        const coincideCategoria =
            categoriaSeleccionada === "todos" ||
            producto.categoria === categoriaSeleccionada;

        return coincideNombre && coincideCategoria;
    });

    contenedor.replaceChildren();

    filtrados.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto-card";

        const imagen = document.createElement("div");
        imagen.className = "producto-icono";
        imagen.textContent = producto.icono;
        imagen.setAttribute("aria-hidden", "true");

        const categoria = document.createElement("span");
        categoria.className = "producto-categoria";
        categoria.textContent = {
            frutas: "Frutas",
            cereales: "Cereales",
            otros: "Otros cultivos"
        }[producto.categoria];

        const titulo = document.createElement("h2");
        titulo.textContent = producto.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.descripcion;

        tarjeta.append(imagen, categoria, titulo, descripcion);
        contenedor.appendChild(tarjeta);
    });

    contador.textContent =
        `${filtrados.length} producto${filtrados.length === 1 ? "" : "s"} encontrado${filtrados.length === 1 ? "" : "s"}`;

    sinResultados.hidden = filtrados.length > 0;
}

buscador.addEventListener("input", mostrarProductos);
filtro.addEventListener("change", mostrarProductos);

mostrarProductos();