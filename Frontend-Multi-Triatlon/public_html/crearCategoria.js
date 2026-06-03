/**
 * crearCategoria.js
 * -----------------
 * Flujo:
 * POST http://localhost:9093/api/categorias/crear
 * Body (CategoriaDTO): { nombreCategoria, tipoCategoria, descripcion, recomendacion }
 */

document.addEventListener("DOMContentLoaded", () => {
    const ENDPOINT = "http://localhost:9093/api/categorias/crear";

    // DOM
    const userNombreEl = document.getElementById("user-nombre");
    const btnLogout = document.getElementById("btn-logout");
    const form = document.getElementById("form-crear");
    const inputNombre = document.getElementById("nombre-categoria");
    const inputTipo = document.getElementById("tipo-categoria");
    const inputDescripcion = document.getElementById("descripcion");
    const inputRecomendacion = document.getElementById("recomendacion");
    const btnCrear = document.getElementById("btn-crear");
    const mensaje = document.getElementById("mensaje");

    // Helpers
    function getSessionUser() {
        try { return JSON.parse(localStorage.getItem("sessionUser")); } catch { return null; }
    }

    function setMensaje(texto, tipo = "info") {
        if (!mensaje) return;
        mensaje.textContent = texto;
        if (tipo === "error") mensaje.style.color = "#8b1d1d";
        else if (tipo === "ok") mensaje.style.color = "#0A3323";
        else mensaje.style.color = "";
    }

    // Submit
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMensaje("");

        const nombreCategoria = (inputNombre?.value ?? "").trim();
        const tipoCategoria = (inputTipo?.value ?? "").trim();
        const descripcion = (inputDescripcion?.value ?? "").trim();
        const recomendacion = (inputRecomendacion?.value ?? "").trim();

        if (!nombreCategoria || !tipoCategoria || !descripcion || !recomendacion) {
            setMensaje("Por favor completa todos los campos obligatorios (*).", "error");
            return;
        }

        const payload = { nombreCategoria, tipoCategoria, descripcion, recomendacion };
        console.log("CategoriaDTO =>", payload);

        if (btnCrear) btnCrear.disabled = true;

        try {
            const resp = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(txt || `Error HTTP ${resp.status}`);
            }

            const creada = await resp.json(); // CategoriaResponse
            console.log("CategoriaResponse =>", creada);
            setMensaje(`¡Categoría "${creada.nombreCategoria}" creada con éxito (ID: ${creada.id}).`, "ok");
            form.reset();
        } catch (err) {
            console.error(err);
            setMensaje(`No fue posible crear la categoría. ${err.message || ""}`.trim(), "error");
        } finally {
            if (btnCrear) btnCrear.disabled = false;
        }
    });

    // Sesión
    const sessionUser = getSessionUser();
    if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";
    btnLogout?.addEventListener("click", () => {
        localStorage.removeItem("sessionUser");
        window.location.href = "index.html";
    });
});