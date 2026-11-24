
const API_ESTADISTICAS =
    "https://www.datos.gov.co/resource/qi54-achv.json";

const elementoGrafica =
    document.getElementById("grafica-produccion");

const elementoEstado =
    document.getElementById("estado-grafica");

let graficaProduccion = null;
let graficaCultivos = null;

function normalizarTexto(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function convertirNumero(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
}

async function consultarAPI(parametros) {
    const respuesta = await fetch(
        `${API_ESTADISTICAS}?${parametros.toString()}`
    );

    if (!respuesta.ok) {
        throw new Error(
            `Error al consultar los datos: ${respuesta.status}`
        );
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
        throw new Error("La API devolvió datos con formato inesperado.");
    }

    return datos;
}

// Crea la tarjeta de la segunda gráfica si todavía no existe.
function prepararGraficaCultivos() {
    let canvas = document.getElementById("grafica-cultivos");

    if (canvas) {
        return canvas;
    }

    const tarjetaOriginal = elementoGrafica?.closest(".grafica-card");

    if (!tarjetaOriginal) {
        throw new Error(
            "No se encontró la tarjeta de la primera gráfica."
        );
    }

    const tarjeta = document.createElement("section");
    tarjeta.className = "grafica-card";
    tarjeta.style.marginTop = "25px";

    tarjeta.innerHTML = `
        <h2>Comparación de cultivos en Caldas</h2>

        <p class="texto-secundario">
            Producción registrada en toneladas para el año más reciente
            disponible en la fuente de datos.
        </p>

        <p id="estado-cultivos" class="estado" role="status"
           aria-live="polite">
            Cargando datos de los cultivos...
        </p>

        <div class="grafica-contenedor">
            <canvas
                id="grafica-cultivos"
                role="img"
                aria-label="Comparación de la producción de diferentes cultivos en Caldas">
                Tu navegador no permite visualizar esta gráfica.
            </canvas>
        </div>

        <p class="nota-datos">
            Fuente:
            <a
                href="https://www.datos.gov.co/resource/qi54-achv.json"
                target="_blank"
                rel="noopener noreferrer">
                Datos Abiertos Colombia
            </a>.
            Los resultados dependen de los registros disponibles.
        </p>
    `;

    tarjetaOriginal.insertAdjacentElement("afterend", tarjeta);

    return tarjeta.querySelector("#grafica-cultivos");
}

// Primera gráfica: producción de café en Manizales por año.
async function cargarProduccionCafe() {
    if (!elementoGrafica || !elementoEstado) {
        throw new Error(
            "No se encontraron los elementos HTML de la gráfica del café."
        );
    }

    elementoEstado.textContent = "Consultando datos agrícolas...";

    const parametros = new URLSearchParams();

    parametros.set(
        "$select",
        "municipio,cultivo,a_o,producci_n_t"
    );
    parametros.set("$where", "municipio = 'Manizales'");
    parametros.set("$limit", "5000");

    const datos = await consultarAPI(parametros);

    const registrosCafe = datos.filter(registro =>
        normalizarTexto(registro.cultivo).includes("cafe")
    );

    if (registrosCafe.length === 0) {
        throw new Error(
            "No se encontraron registros de café para Manizales."
        );
    }

    const produccionPorAnio = {};

    registrosCafe.forEach(registro => {
        const anio = convertirNumero(registro.a_o);
        const produccion = convertirNumero(registro.producci_n_t);

        if (anio === null || produccion === null) {
            return;
        }

        if (!produccionPorAnio[anio]) {
            produccionPorAnio[anio] = [];
        }

        produccionPorAnio[anio].push(produccion);
    });

    const anios = Object.keys(produccionPorAnio)
        .map(Number)
        .sort((a, b) => a - b);

    const producciones = anios.map(anio =>
        produccionPorAnio[anio].reduce(
            (total, valor) => total + valor,
            0
        )
    );

    if (anios.length === 0) {
        throw new Error(
            "No hay valores válidos para la gráfica del café."
        );
    }

    if (graficaProduccion) {
        graficaProduccion.destroy();
    }

    graficaProduccion = new Chart(elementoGrafica, {
        type: "bar",

        data: {
            labels: anios,

            datasets: [{
                label: "Producción de café (toneladas)",
                data: producciones,
                backgroundColor: "#2e7d32",
                hoverBackgroundColor: "#1b5e20",
                borderColor: "#1b5e20",
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 65
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    display: true,
                    position: "top"
                },

                tooltip: {
                    callbacks: {
                        label: contexto => {
                            const valor =
                                contexto.parsed.y.toLocaleString(
                                    "es-CO",
                                    { maximumFractionDigits: 2 }
                                );

                            return `${contexto.dataset.label}: ${valor}`;
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Producción (toneladas)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Año"
                    }
                }
            }
        }
    });

    elementoEstado.textContent =
        `Gráfica generada con ${registrosCafe.length} registros de café para Manizales.`;
}

// Segunda gráfica: comparación de cultivos en Caldas.
async function cargarComparacionCultivos() {
    const canvas = prepararGraficaCultivos();
    const estado = document.getElementById("estado-cultivos");

    estado.textContent = "Consultando producción por cultivo...";

    const parametros = new URLSearchParams();

    parametros.set(
        "$select",
        "municipio,cultivo,a_o,periodo,producci_n_t"
    );
    parametros.set("$order", "a_o DESC");
    parametros.set("$limit", "5000");

    const datos = await consultarAPI(parametros);

    const registrosValidos = datos.filter(registro =>
        registro.cultivo &&
        convertirNumero(registro.a_o) !== null &&
        convertirNumero(registro.producci_n_t) !== null
    );

    if (registrosValidos.length === 0) {
        throw new Error(
            "No se encontraron datos válidos para comparar los cultivos."
        );
    }

    // Identifica el año más reciente incluido en los datos consultados.
    const anioMasReciente = Math.max(
        ...registrosValidos.map(registro =>
            convertirNumero(registro.a_o)
        )
    );

    const registrosDelAnio = registrosValidos.filter(registro =>
        convertirNumero(registro.a_o) === anioMasReciente
    );

    // Agrupa la producción registrada por nombre de cultivo.
    const cultivos = {};

    registrosDelAnio.forEach(registro => {
        const nombreCultivo = String(registro.cultivo).trim();
        const clave = normalizarTexto(nombreCultivo);
        const produccion = convertirNumero(registro.producci_n_t);

        if (!clave || produccion === null) {
            return;
        }

        if (!cultivos[clave]) {
            cultivos[clave] = {
                nombre: nombreCultivo,
                produccion: 0
            };
        }

        // Se suman los registros del cultivo en los municipios
        // y periodos incluidos en el conjunto de datos.
        cultivos[clave].produccion += produccion;
    });

    // Muestra los 10 cultivos con mayor producción registrada.
    const principalesCultivos = Object.values(cultivos)
        .sort((a, b) => b.produccion - a.produccion)
        .slice(0, 10);

    if (principalesCultivos.length === 0) {
        throw new Error(
            "No se pudieron agrupar los registros por cultivo."
        );
    }

    if (graficaCultivos) {
        graficaCultivos.destroy();
    }

    graficaCultivos = new Chart(canvas, {
        type: "bar",

        data: {
            labels: principalesCultivos.map(cultivo => cultivo.nombre),

            datasets: [{
                label: `Producción registrada en ${anioMasReciente} (toneladas)`,
                data: principalesCultivos.map(
                    cultivo => cultivo.produccion
                ),
                backgroundColor: "#66a86b",
                hoverBackgroundColor: "#2e7d32",
                borderColor: "#2e7d32",
                borderWidth: 1,
                borderRadius: 6,
                maxBarThickness: 55
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true,
                    position: "top"
                },

                tooltip: {
                    callbacks: {
                        label: contexto => {
                            const valor =
                                contexto.parsed.y.toLocaleString(
                                    "es-CO",
                                    { maximumFractionDigits: 2 }
                                );

                            return `Producción: ${valor} toneladas`;
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: "Producción (toneladas)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Cultivos"
                    },

                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });

    estado.textContent =
        `Se muestran ${principalesCultivos.length} cultivos con mayor producción registrada para ${anioMasReciente}.`;
}

// Ejecuta ambas gráficas aunque una de las consultas falle.
async function iniciarGraficas() {
    const resultados = await Promise.allSettled([
        cargarProduccionCafe(),
        cargarComparacionCultivos()
    ]);

    resultados.forEach((resultado, indice) => {
        if (resultado.status === "rejected") {
            console.error(
                indice === 0
                    ? "Error en la gráfica del café:"
                    : "Error en la comparación de cultivos:",
                resultado.reason
            );

            if (indice === 0 && elementoEstado) {
                elementoEstado.textContent =
                    "No fue posible cargar la gráfica del café. Revisa la conexión y la consola.";
            }

            if (indice === 1) {
                const estado =
                    document.getElementById("estado-cultivos");

                if (estado) {
                    estado.textContent =
                        "No fue posible cargar la comparación de cultivos. Revisa la conexión y la consola.";
                }
            }
        }
    });
}

iniciarGraficas();