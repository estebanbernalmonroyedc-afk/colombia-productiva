
const API_BASE = "https://api-colombia.com/api/v1";

async function obtenerDepartamentos() {
    const respuesta = await fetch(`${API_BASE}/Department`);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const departamentos = await respuesta.json();

    if (!Array.isArray(departamentos)) {
        throw new Error("La API no devolvió una lista de departamentos.");
    }

    return departamentos;
}