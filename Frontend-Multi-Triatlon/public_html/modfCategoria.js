/**
 * modfCategoria.js
 * ----------------
 * Flujo:
 * 1) GET  http://localhost:9093/api/categorias/todas          → llenar scroll
 * 2) Usuario selecciona una categoría (se habilitan los formularios)
 * 3a) PATCH http://localhost:9093/api/categorias/{id}/descripcion
 *     Body: { "descripcion": "..." }
 * 3b) PATCH http://localhost:9093/api/categorias/{id}/recomendacion
 *     Body: { "recomendacion": "..." }
 */

document.addEventListener("DOMContentLoaded", () => {
    const API = "http://localhost:9093";
    const ENDPOINT_TODAS = `${API}/api/categorias/todas`;
    const ENDPOINT_DESCRIPCION = (id) => `${API}/api/categorias/${id}/descripcion`;
    const ENDPOINT_RECOMENDACION = (id) => `${API}/api/categorias/${id}/recomendacion`;

    // DOM
    const userNombreEl = document.getElementById("user-nombre");
    const btnLogout = document.getElementById("btn-logout");
    const btnRecargar = document.getElementById("btn-recargar");
    const categoriasEstado = document.getElementById("categorias-estado");
    const categoriasScroll = document.getElementById("categorias-scroll");
    const inputCategoriaId = document.getElementById("categoria-id");
    const mensajeCategorias = document.getElementById("mensaje-categorias");
    const categoriaInfo = document.getElementById("categoria-info");

    const formDescripcion = document.getElementById("form-descripcion");
    const inputDescripcion = document.getElementById("nueva-descripcion");
    const btnDescripcion = document.getElementById("btn-descripcion");
    const mensajeDescripcion = document.getElementById("mensaje-descripcion");

    const formRecomendacion = document.getElementById("form-recomendacion");
    const inputRecomendacion = document.getElementById("nueva-recomendacion");
    const btnRecomendacion = document.getElementById("btn-recomendacion");
    const mensajeRecomendacion = document.getElementById("mensaje-recomendacion");

    // State
    let categoriasDisponibles = [];
    let categoriaSeleccionada = null;

    // Helpers
    function getSessionUser() {
        try { return JSON.parse(localStorage.getItem("sessionUser")); } catch { return null; }
    }

    function setMensaje(el, texto, tipo = "info") {
        if (!el) return;
        el.textContent = texto;
        if (tipo === "error") el.style.color = "#8b1d1d";
        else if (tipo === "ok") el.style.color = "#0A3323";
        else el.style.color = "";
    }

    function setEstado(texto, tipo = "info") {
        if (!categoriasEstado) return;
        categoriasEstado.textContent = texto;
        if (tipo === "error") categoriasEstado.style.color = "#8b1d1d";
        else if (tipo === "ok") categoriasEstado.style.color = "#0A3323";
        else categoriasEstado.style.color = "";
    }

    function habilitarFormularios(cat) {
        const activo = cat !== null;
        if (inputDescripcion) inputDescripcion.disabled = !activo;
        if (btnDescripcion) btnDescripcion.disabled = !activo;
        if (inputRecomendacion) inputRecomendacion.disabled = !activo;
        if (btnRecomendacion) btnRecomendacion.disabled = !activo;

        if (categoriaInfo) categoriaInfo.textContent = activo
            ? `Categoría seleccionada: ${cat.nombreCategoria} (ID: ${cat.id}).`
            : "Selecciona una categoría para habilitar los formularios.";

        if (activo) {
            if (inputDescripcion) inputDescripcion.value = cat.descripcion ?? "";
            if (inputRecomendacion) inputRecomendacion.value = cat.recomendacion ?? "";
        } else {
            if (inputDescripcion) inputDescripcion.value = "";
            if (inputRecomendacion) inputRecomendacion.value = "";
        }

        setMensaje(mensajeDescripcion, "");
        setMensaje(mensajeRecomendacion, "");
    }

    // Render scroll
    function renderCategorias(lista) {
        if (!categoriasScroll) return;
        categoriasScroll.innerHTML = "";

        lista.forEach((c) => {
            const item = document.createElement("div");
            item.className = "categoria-item";
            item.setAttribute("role", "listitem");
            item.setAttribute("tabindex", "0");
            if (categoriaSeleccionada?.id === c.id) item.classList.add("is-active");

            item.innerHTML = `
        <p class="categoria-nombre">${c.nombreCategoria ?? "Categoría"}</p>
        <div class="categoria-meta">
          <div><b>ID:</b> ${c.id}</div>
          <div><b>Tipo:</b> ${c.tipoCategoria ?? "—"}</div>
        </div>
      `;

            function seleccionar() {
                categoriaSeleccionada = c;
                if (inputCategoriaId) inputCategoriaId.value = String(c.id);
                habilitarFormularios(c);
                renderCategorias(categoriasDisponibles);
            }

            item.addEventListener("click", seleccionar);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(); }
            });

            categoriasScroll.appendChild(item);
        });
    }

    // Load
    async function loadCategorias() {
        setMensaje(mensajeCategorias, "");
        setEstado("Cargando categorías...");
        try {
            const resp = await fetch(ENDPOINT_TODAS);
            if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
            const data = await resp.json();

            if (!Array.isArray(data) || data.length === 0) {
                categoriasDisponibles = [];
                renderCategorias([]);
                setEstado("No hay categorías disponibles.", "info");
                habilitarFormularios(null);
                return;
            }

            categoriasDisponibles = data;
            if (categoriaSeleccionada) {
                const sigue = categoriasDisponibles.find((c) => c.id === categoriaSeleccionada.id);
                categoriaSeleccionada = sigue ?? null;
                habilitarFormularios(categoriaSeleccionada);
                if (!sigue && inputCategoriaId) inputCategoriaId.value = "";
            }

            renderCategorias(categoriasDisponibles);
            setEstado(`${data.length} categoría(s) disponibles. Selecciona una.`, "ok");
        } catch (err) {
            console.error(err);
            setEstado(`Error cargando categorías: ${err.message}`, "error");
            habilitarFormularios(null);
        }
    }

    // Submit descripción
    formDescripcion?.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMensaje(mensajeDescripcion, "");

        const id = (inputCategoriaId?.value ?? "").trim();
        const descripcion = (inputDescripcion?.value ?? "").trim();

        if (!id) { setMensaje(mensajeDescripcion, "Selecciona una categoría primero.", "error"); return; }
        if (!descripcion) { setMensaje(mensajeDescripcion, "La descripción no puede estar vacía.", "error"); return; }

        if (btnDescripcion) btnDescripcion.disabled = true;
        try {
            const resp = await fetch(ENDPOINT_DESCRIPCION(id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ descripcion }),
            });
            if (!resp.ok) throw new Error(await resp.text().catch(() => `Error HTTP ${resp.status}`));

            setMensaje(mensajeDescripcion, "Descripción actualizada correctamente.", "ok");
            if (categoriaSeleccionada) {
                categoriaSeleccionada.descripcion = descripcion;
                const idx = categoriasDisponibles.findIndex((c) => c.id === categoriaSeleccionada.id);
                if (idx !== -1) categoriasDisponibles[idx].descripcion = descripcion;
            }
        } catch (err) {
            console.error(err);
            setMensaje(mensajeDescripcion, `No fue posible actualizar. ${err.message || ""}`.trim(), "error");
        } finally {
            if (btnDescripcion) btnDescripcion.disabled = false;
        }
    });

    // Submit recomendación
    formRecomendacion?.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMensaje(mensajeRecomendacion, "");

        const id = (inputCategoriaId?.value ?? "").trim();
        const recomendacion = (inputRecomendacion?.value ?? "").trim();

        if (!id) { setMensaje(mensajeRecomendacion, "Selecciona una categoría primero.", "error"); return; }
        if (!recomendacion) { setMensaje(mensajeRecomendacion, "La recomendación no puede estar vacía.", "error"); return; }

        if (btnRecomendacion) btnRecomendacion.disabled = true;
        try {
            const resp = await fetch(ENDPOINT_RECOMENDACION(id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recomendacion }),
            });
            if (!resp.ok) throw new Error(await resp.text().catch(() => `Error HTTP ${resp.status}`));

            setMensaje(mensajeRecomendacion, "Recomendación actualizada correctamente.", "ok");
            if (categoriaSeleccionada) {
                categoriaSeleccionada.recomendacion = recomendacion;
                const idx = categoriasDisponibles.findIndex((c) => c.id === categoriaSeleccionada.id);
                if (idx !== -1) categoriasDisponibles[idx].recomendacion = recomendacion;
            }
        } catch (err) {
            console.error(err);
            setMensaje(mensajeRecomendacion, `No fue posible actualizar. ${err.message || ""}`.trim(), "error");
        } finally {
            if (btnRecomendacion) btnRecomendacion.disabled = false;
        }
    });

    // Sesión y eventos
    const sessionUser = getSessionUser();
    if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";
    btnLogout?.addEventListener("click", () => {
        localStorage.removeItem("sessionUser");
        window.location.href = "index.html";
    });
    btnRecargar?.addEventListener("click", loadCategorias);

    // Init
    loadCategorias();
});