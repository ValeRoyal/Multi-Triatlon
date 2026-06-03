/**
 * elimCarrera.js
 * --------------
 * Flujo:
 * 1) GET  http://localhost:9092/api/carreras/todas  → llenar scroll
 * 2) Usuario selecciona una carrera
 * 3) DELETE http://localhost:9092/api/carreras/eliminar/{id}  → eliminar
 */

document.addEventListener("DOMContentLoaded", () => {
    const API = "http://localhost:9092";
    const ENDPOINT_TODAS = `${API}/api/carreras/todas`;
    const ENDPOINT_ELIMINAR = (id) => `${API}/api/carreras/eliminar/${id}`;

    // DOM
    const btnLogout = document.getElementById("btn-logout");
    const userNombreEl = document.getElementById("user-nombre");
    const btnRecargar = document.getElementById("btn-recargar");
    const btnEliminar = document.getElementById("btn-eliminar");
    const carrerasEstado = document.getElementById("carreras-estado");
    const carrerasScroll = document.getElementById("carreras-scroll");
    const inputCarreraId = document.getElementById("carrera-id");
    const mensaje = document.getElementById("mensaje");

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

    // Render
    function renderCarreras(lista) {
        if (!carrerasScroll) return;
        carrerasScroll.innerHTML = "";

        lista.forEach((c) => {
            const item = document.createElement("div");
            item.className = "carrera-item";
            item.setAttribute("role", "listitem");
            item.setAttribute("tabindex", "0");
            item.dataset.id = String(c.id);

            if (carreraSeleccionada?.id === c.id) item.classList.add("is-active");

            item.innerHTML = `
        <p class="carrera-nombre">${c.nombreCarrera ?? "Carrera"}</p>
        <div class="carrera-meta">
          <div><b>ID:</b> ${c.id}</div>
          <div><b>Ubicación:</b> ${c.ubicacion ?? "—"}</div>
          <div><b>Fecha:</b> ${c.fechaEjecucion ?? "—"}</div>
          <div><b>Dificultad:</b> ${c.nivelDificultad ?? "—"}</div>
        </div>
      `;

            function seleccionar() {
                carreraSeleccionada = c;
                if (inputCarreraId) inputCarreraId.value = String(c.id);
                if (btnEliminar) btnEliminar.disabled = false;
                setMensaje(`Carrera seleccionada: ${c.nombreCarrera} (ID: ${c.id}).`);
                renderCarreras(carrerasDisponibles);
            }

            item.addEventListener("click", seleccionar);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(); }
            });

            carrerasScroll.appendChild(item);
        });
    }

    // Load
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
            // Mantener selección previa si sigue existiendo
            if (carreraSeleccionada) {
                const sigue = carrerasDisponibles.find((c) => c.id === carreraSeleccionada.id);
                carreraSeleccionada = sigue ?? null;
                if (!sigue) { if (inputCarreraId) inputCarreraId.value = ""; if (btnEliminar) btnEliminar.disabled = true; }
            }

            renderCarreras(carrerasDisponibles);
            setEstado(`${data.length} carrera(s) disponibles. Selecciona una.`, "ok");
        } catch (err) {
            console.error(err);
            setEstado(`Error cargando carreras: ${err.message}`, "error");
        }
    }

    // Eliminar
    btnEliminar?.addEventListener("click", async () => {
        const id = (inputCarreraId?.value ?? "").trim();
        if (!id || !carreraSeleccionada) {
            setMensaje("Selecciona una carrera primero.", "error");
            return;
        }

        const confirmar = window.confirm(
            `¿Seguro que deseas eliminar la carrera "${carreraSeleccionada.nombreCarrera}" (ID: ${id})? Esta acción no se puede deshacer.`
        );
        if (!confirmar) return;

        btnEliminar.disabled = true;
        setMensaje("");

        try {
            const resp = await fetch(ENDPOINT_ELIMINAR(id), { method: "DELETE" });
            if (!resp.ok) {
                const txt = await resp.text().catch(() => "");
                throw new Error(txt || `Error HTTP ${resp.status}`);
            }

            setMensaje(`Carrera "${carreraSeleccionada.nombreCarrera}" eliminada correctamente.`, "ok");
            carrerasDisponibles = carrerasDisponibles.filter((c) => c.id !== carreraSeleccionada.id);
            carreraSeleccionada = null;
            if (inputCarreraId) inputCarreraId.value = "";
            renderCarreras(carrerasDisponibles);
            setEstado(`${carrerasDisponibles.length} carrera(s) disponibles.`, "ok");
        } catch (err) {
            console.error(err);
            setMensaje(`No fue posible eliminar la carrera. ${err.message || ""}`.trim(), "error");
            btnEliminar.disabled = false;
        }
    });

    // Eventos
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