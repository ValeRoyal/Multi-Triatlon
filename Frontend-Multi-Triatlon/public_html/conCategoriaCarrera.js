/**
 * conCategoriaCarrera.js
 * ----------------------
 * Flujo:
 * 1) GET http://localhost:9092/api/carreras/todas          → llenar scroll
 * 2) Usuario selecciona una carrera
 * 3) GET http://localhost:9092/api/carreras/categoria/{id} → CategoriaResponse
 */

document.addEventListener("DOMContentLoaded", () => {
    const API = "http://localhost:9092";
    const ENDPOINT_TODAS = `${API}/api/carreras/todas`;
    const ENDPOINT_CATEGORIA = (id) => `${API}/api/carreras/categoria/${id}`;

    // DOM
    const userNombreEl = document.getElementById("user-nombre");
    const btnLogout = document.getElementById("btn-logout");
    const btnRecargar = document.getElementById("btn-recargar");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const btnConsultar = document.getElementById("btn-consultar");
    const carrerasEstado = document.getElementById("carreras-estado");
    const carrerasScroll = document.getElementById("carreras-scroll");
    const inputCarreraId = document.getElementById("carrera-id");
    const mensaje = document.getElementById("mensaje");
    const resultadoSubtitulo = document.getElementById("resultado-subtitulo");
    const resultadoWrap = document.getElementById("resultado-wrap");

    // State
    let carrerasDisponibles = [];
    let carreraSeleccionada = null;

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
        if (!carrerasEstado) return;
        carrerasEstado.textContent = texto;
        if (tipo === "error") carrerasEstado.style.color = "#8b1d1d";
        else if (tipo === "ok") carrerasEstado.style.color = "#0A3323";
        else carrerasEstado.style.color = "";
    }

    function safeText(v) { return (v === null || v === undefined || v === "") ? "—" : String(v); }

    // Render scroll
    function renderCarreras(lista) {
        if (!carrerasScroll) return;
        carrerasScroll.innerHTML = "";

        lista.forEach((c) => {
            const item = document.createElement("div");
            item.className = "carrera-item";
            item.setAttribute("role", "listitem");
            item.setAttribute("tabindex", "0");
            if (carreraSeleccionada?.id === c.id) item.classList.add("is-active");

            item.innerHTML = `
        <p class="carrera-nombre">${c.nombreCarrera ?? "Carrera"}</p>
        <div class="carrera-meta">
          <div><b>ID:</b> ${c.id}</div>
          <div><b>Ubicación:</b> ${c.ubicacion ?? "—"}</div>
          <div><b>Fecha:</b> ${c.fechaEjecucion ?? "—"}</div>
        </div>
      `;

            function seleccionar() {
                carreraSeleccionada = c;
                if (inputCarreraId) inputCarreraId.value = String(c.id);
                if (btnConsultar) btnConsultar.disabled = false;
                setMensaje(`Carrera seleccionada: ${c.nombreCarrera} (ID: ${c.id}).`);
                if (resultadoSubtitulo) resultadoSubtitulo.textContent = "Aún no has consultado.";
                if (resultadoWrap) resultadoWrap.innerHTML = "";
                renderCarreras(carrerasDisponibles);
            }

            item.addEventListener("click", seleccionar);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(); }
            });

            carrerasScroll.appendChild(item);
        });
    }

    // Render resultado
    function renderCategoria(cat) {
        if (!resultadoWrap) return;
        resultadoWrap.innerHTML = "";

        const card = document.createElement("div");
        card.className = "card categoria-resultado";

        card.innerHTML = `
      <div class="cat-fila">
        <span class="cat-label">ID</span>
        <span class="cat-valor">${safeText(cat.id)}</span>
      </div>
      <div class="cat-fila">
        <span class="cat-label">Nombre</span>
        <span class="cat-valor">${safeText(cat.nombreCategoria)}</span>
      </div>
      <div class="cat-fila">
        <span class="cat-label">Tipo</span>
        <span class="cat-valor">${safeText(cat.tipoCategoria)}</span>
      </div>
      <div class="cat-fila fila-full">
        <span class="cat-label">Descripción</span>
        <span class="cat-valor">${safeText(cat.descripcion)}</span>
      </div>
      <div class="cat-fila fila-full">
        <span class="cat-label">Recomendación</span>
        <span class="cat-valor">${safeText(cat.recomendacion)}</span>
      </div>
    `;

        resultadoWrap.appendChild(card);
    }

    // Load carreras
    async function loadCarreras() {
        setMensaje("");
        setEstado("Cargando carreras...");
        try {
            const resp = await fetch(ENDPOINT_TODAS);
            if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
            const data = await resp.json();

            if (!Array.isArray(data) || data.length === 0) {
                carrerasDisponibles = [];
                renderCarreras([]);
                setEstado("No hay carreras disponibles.", "info");
                return;
            }

            carrerasDisponibles = data;
            if (carreraSeleccionada) {
                const sigue = carrerasDisponibles.find((c) => c.id === carreraSeleccionada.id);
                carreraSeleccionada = sigue ?? null;
                if (!sigue) { if (inputCarreraId) inputCarreraId.value = ""; if (btnConsultar) btnConsultar.disabled = true; }
            }

            renderCarreras(carrerasDisponibles);
            setEstado(`${data.length} carrera(s) disponibles. Selecciona una.`, "ok");
        } catch (err) {
            console.error(err);
            setEstado(`Error cargando carreras: ${err.message}`, "error");
        }
    }

    // Consultar categoría
    btnConsultar?.addEventListener("click", async () => {
        const id = (inputCarreraId?.value ?? "").trim();
        if (!id) { setMensaje("Selecciona una carrera primero.", "error"); return; }

        setMensaje("");
        if (resultadoWrap) resultadoWrap.innerHTML = "";
        if (resultadoSubtitulo) resultadoSubtitulo.textContent = "Consultando...";

        try {
            const resp = await fetch(ENDPOINT_CATEGORIA(id));
            if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
            const cat = await resp.json();

            renderCategoria(cat);
            if (resultadoSubtitulo) resultadoSubtitulo.textContent =
                `Categoría de la carrera "${carreraSeleccionada?.nombreCarrera ?? id}".`;
            setMensaje("Consulta realizada correctamente.", "ok");
        } catch (err) {
            console.error(err);
            if (resultadoSubtitulo) resultadoSubtitulo.textContent = "Ocurrió un error al consultar.";
            setMensaje(`No fue posible consultar. ${err.message || ""}`.trim(), "error");
        }
    });

    // Limpiar
    btnLimpiar?.addEventListener("click", () => {
        setMensaje("");
        carreraSeleccionada = null;
        if (inputCarreraId) inputCarreraId.value = "";
        if (btnConsultar) btnConsultar.disabled = true;
        if (resultadoWrap) resultadoWrap.innerHTML = "";
        if (resultadoSubtitulo) resultadoSubtitulo.textContent = "Aún no has consultado.";
        renderCarreras(carrerasDisponibles);
    });

    // Eventos sesión
    const sessionUser = getSessionUser();
    if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";
    btnLogout?.addEventListener("click", () => {
        localStorage.removeItem("sessionUser");
        window.location.href = "index.html";
    });

    btnRecargar?.addEventListener("click", loadCarreras);

    // Init
    loadCarreras();
});