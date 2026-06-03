/**
 * conCarreraCategoria.js
 * ----------------------
 * Flujo:
 * 1) GET http://localhost:9093/api/categorias/todas
 *      → llenar scroll de categorías
 * 2) Usuario selecciona una categoría
 * 3) GET http://localhost:9093/api/categorias/consultar-carreras-por-categoria/{categoriaId}
 *      → List<CarreraResponse>
 */

document.addEventListener("DOMContentLoaded", () => {
    const API = "http://localhost:9093";
    const ENDPOINT_TODAS = `${API}/api/categorias/todas`;
    const ENDPOINT_CARRERAS = (id) => `${API}/api/categorias/consultar-carreras-por-categoria/${id}`;

    // DOM
    const userNombreEl = document.getElementById("user-nombre");
    const btnLogout = document.getElementById("btn-logout");
    const btnRecargar = document.getElementById("btn-recargar");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const btnConsultar = document.getElementById("btn-consultar");
    const categoriasEstado = document.getElementById("categorias-estado");
    const categoriasScroll = document.getElementById("categorias-scroll");
    const inputCategoriaId = document.getElementById("categoria-id");
    const mensaje = document.getElementById("mensaje");
    const contador = document.getElementById("contador");
    const resultadosWrap = document.getElementById("resultados-wrap");

    // State
    let categoriasDisponibles = [];
    let categoriaSeleccionada = null;

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

    function setEstado(texto, tipo = "info") {
        if (!categoriasEstado) return;
        categoriasEstado.textContent = texto;
        if (tipo === "error") categoriasEstado.style.color = "#8b1d1d";
        else if (tipo === "ok") categoriasEstado.style.color = "#0A3323";
        else categoriasEstado.style.color = "";
    }

    function safeText(v) { return (v === null || v === undefined || v === "") ? "—" : String(v); }

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
                if (btnConsultar) btnConsultar.disabled = false;
                setMensaje(`Categoría seleccionada: ${c.nombreCategoria} (ID: ${c.id}).`);
                if (resultadosWrap) resultadosWrap.innerHTML = "";
                if (contador) contador.textContent = "Aún no has consultado.";
                renderCategorias(categoriasDisponibles);
            }

            item.addEventListener("click", seleccionar);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(); }
            });

            categoriasScroll.appendChild(item);
        });
    }

    // Render tabla
    function renderTablaCarreras(carreras) {
        const wrap = document.createElement("div");
        wrap.className = "table-wrap";

        const table = document.createElement("table");
        table.className = "table";

        const headers = ["ID", "Nombre", "Ubicación", "Fecha ejecución", "Dificultad", "Para quién"];
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        headers.forEach((h) => {
            const th = document.createElement("th");
            th.textContent = h;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);

        const tbody = document.createElement("tbody");
        carreras.forEach((c) => {
            const tr = document.createElement("tr");
            [c.id, c.nombreCarrera, c.ubicacion, c.fechaEjecucion, c.nivelDificultad, c.paraQuien]
                .forEach((val) => {
                    const td = document.createElement("td");
                    td.textContent = safeText(val);
                    tr.appendChild(td);
                });
            tbody.appendChild(tr);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        wrap.appendChild(table);
        return wrap;
    }

    // Load categorías
    async function loadCategorias() {
        setMensaje("");
        setEstado("Cargando categorías...");
        try {
            const resp = await fetch(ENDPOINT_TODAS);
            if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
            const data = await resp.json();

            if (!Array.isArray(data) || data.length === 0) {
                categoriasDisponibles = [];
                renderCategorias([]);
                setEstado("No hay categorías disponibles.", "info");
                return;
            }

            categoriasDisponibles = data;
            if (categoriaSeleccionada) {
                const sigue = categoriasDisponibles.find((c) => c.id === categoriaSeleccionada.id);
                categoriaSeleccionada = sigue ?? null;
                if (!sigue) { if (inputCategoriaId) inputCategoriaId.value = ""; if (btnConsultar) btnConsultar.disabled = true; }
            }

            renderCategorias(categoriasDisponibles);
            setEstado(`${data.length} categoría(s) disponibles. Selecciona una.`, "ok");
        } catch (err) {
            console.error(err);
            setEstado(`Error cargando categorías: ${err.message}`, "error");
        }
    }

    // Consultar carreras
    btnConsultar?.addEventListener("click", async () => {
        const id = (inputCategoriaId?.value ?? "").trim();
        if (!id) { setMensaje("Selecciona una categoría primero.", "error"); return; }

        setMensaje("");
        if (resultadosWrap) resultadosWrap.innerHTML = "";
        if (contador) contador.textContent = "Consultando...";

        try {
            const resp = await fetch(ENDPOINT_CARRERAS(id));
            if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
            const carreras = await resp.json();

            if (!Array.isArray(carreras) || carreras.length === 0) {
                if (contador) contador.textContent = `0 carreras en la categoría "${categoriaSeleccionada?.nombreCategoria}".`;
                setMensaje("No hay carreras asociadas a esta categoría.", "info");
                return;
            }

            resultadosWrap.appendChild(renderTablaCarreras(carreras));
            if (contador) contador.textContent =
                `${carreras.length} carrera(s) en la categoría "${categoriaSeleccionada?.nombreCategoria}".`;
            setMensaje("Consulta realizada correctamente.", "ok");
        } catch (err) {
            console.error(err);
            if (contador) contador.textContent = "Ocurrió un error al consultar.";
            setMensaje(`No fue posible consultar. ${err.message || ""}`.trim(), "error");
        }
    });

    // Limpiar
    btnLimpiar?.addEventListener("click", () => {
        setMensaje("");
        categoriaSeleccionada = null;
        if (inputCategoriaId) inputCategoriaId.value = "";
        if (btnConsultar) btnConsultar.disabled = true;
        if (resultadosWrap) resultadosWrap.innerHTML = "";
        if (contador) contador.textContent = "Aún no has consultado.";
        renderCategorias(categoriasDisponibles);
    });

    // Sesión
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