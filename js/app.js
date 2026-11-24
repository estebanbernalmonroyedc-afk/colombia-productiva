const contenedorDepartamentos = document.getElementById(
    "lista-departamentos"
);

const estadoAPI = document.getElementById("estado-api");
const totalDepartamentos = document.getElementById(
    "total-departamentos"
);

async function cargarDepartamentos() {
    try {
        estadoAPI.textContent = "Conectando con la API de Colombia...";

        const departamentos = await obtenerDepartamentos();

        departamentos.sort((a, b) =>
            a.name.localeCompare(b.name, "es")
        );

        totalDepartamentos.textContent = departamentos.length;

        contenedorDepartamentos.replaceChildren();

        departamentos.forEach((departamento) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "departamento-card";

            const icono = document.createElement("span");
            icono.textContent = "📍";

            const nombre = document.createElement("h3");
            nombre.textContent = departamento.name;

            const descripcion = document.createElement("p");
            descripcion.textContent =
                "Departamento de Colombia";

            tarjeta.append(icono, nombre, descripcion);
            contenedorDepartamentos.appendChild(tarjeta);
        });

        estadoAPI.textContent =
            "Datos territoriales cargados correctamente.";
    } catch (error) {
        console.error("No fue posible cargar los departamentos:", error);

        totalDepartamentos.textContent = "No disponible";
        estadoAPI.textContent =
            "No se pudieron cargar los datos. Verifica tu conexión e inténtalo de nuevo.";
    }
}

cargarDepartamentos();