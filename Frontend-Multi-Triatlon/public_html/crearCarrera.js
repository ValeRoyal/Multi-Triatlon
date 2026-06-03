/**
 * crearCarrera.js
 * ---------------
 * Objetivo:
 * - Crear una nueva carrera de triatlón.
 *
 * Flujo:
 * 1) Traemos todas las categorías disponibles desde el microservicio Categoría:
 *      GET http://localhost:9093/api/categorias/todas
 * 2) El usuario selecciona una categoría (guardamos su id).
 * 3) El usuario llena los datos de la carrera.
 * 4) Al enviar, hacemos POST al microservicio Carrera:
 *      POST http://localhost:9092/api/carreras/crear
 *    Body (CarreraDTO):
 *      { nombreCarrera, ubicacion, fechaEjecucion, nivelDificultad, paraQuien, categoriaId }
 */

document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // 1) CONFIG
    // =========================
    const API_CATEGORIA = "http://localhost:9093";
    const API_CARRERA = "http://localhost:9092";

    const ENDPOINT_CATEGORIAS_TODAS = `${API_CATEGORIA}/api/categorias/todas`;
    const ENDPOINT_CREAR_CARRERA = `${API_CARRERA}/api/carreras/crear`;

    // =========================
    // 2) DOM
    // =========================
    const btnLogout = document.getElementById("btn-logout");
    const userNombreEl = document.getElementById("user-nombre");

    const btnCategoriasRecargar = document.getElementById("btn-categorias-recargar");
    const categoriasEstado = document.getElementById("categorias-estado");
    const categoriasScroll = document.getElementById("categorias-scroll");
    const inputCategoriaId = document.getElementById("categoria-id");
    const mensajeCategorias = document.getElementById("mensaje-categorias");
    const categoriaSeleccionadaEl = document.getElementById("categoria-seleccionada");

    const form = document.getElementById("form-crear");
    const inputNombreCarrera = document.getElementById("nombre-carrera");
    const inputUbicacion = document.getElementById("ubicacion");
    const inputFechaEjecucion = document.getElementById("fecha-ejecucion");
    const inputNivelDificultad = document.getElementById("nivel-dificultad");
    const inputParaQuien = document.getElementById("para-quien");
    const mensajeForm = document.getElementById("mensaje-form");

    // =========================
    // 3) STATE
    // =========================
    let categoriasDisponibles = [];
    let categoriaSeleccionada = null;

    // =========================
    // 4) HELPERS
    // =========================
    function getSessionUser() {
        try {
            const raw = localStorage.getItem("sessionUser");
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function setMensaje(el, texto, tipo = "info") {
        if (!el) return;
        el.textContent = texto;
        if (tipo === "error") el.style.color = "#8b1d1d";
        else if (tipo === "ok") el.style.color = "#0A3323";
        else el.style.color = "";
    }

    function setEstadoCategorias(texto, tipo = "info") {
        if (!categoriasEstado) return;
        categoriasEstado.textContent = texto;
        if (tipo === "error") categoriasEstado.style.color = "#8b1d1d";
        else if (tipo === "ok") categoriasEstado.style.color = "#0A3323";
        else categoriasEstado.style.color = "";
    }

    function actualizarBadgeCategoria(cat) {
        if (!categoriaSeleccionadaEl) return;
        if (!cat) {
            categoriaSeleccionadaEl.innerHTML =
                '<span class="categoria-placeholder">Selecciona una categoría en el panel de arriba.</span>';
            return;
        }
        categoriaSeleccionadaEl.innerHTML = `
      <span class="categoria-badge">${cat.nombreCategoria ?? "—"}</span>
      &nbsp;·&nbsp; ${cat.tipoCategoria ?? "—"}
    `;
    }

    // =========================
    // 5) FETCH
    // =========================
    async function fetchCategoriasTodas() {
        const resp = await fetch(ENDPOINT_CATEGORIAS_TODAS, { method: "GET" });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            throw new Error(txt || `Error HTTP ${resp.status}`);
        }
        return await resp.json(); // List<CategoriaResponse>
    }

    async function fetchCrearCarrera(body) {
        const resp = await fetch(ENDPOINT_CREAR_CARRERA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            throw new Error(txt || `Error HTTP ${resp.status}`);
        }
        return await resp.json(); // CarreraResponse
    }

    // =========================
    // 6) RENDER: categorías scroll
    // =========================
    function renderCategorias(lista) {
        if (!categoriasScroll) return;
        categoriasScroll.innerHTML = "";

        lista.forEach((c) => {
            const item = document.createElement("div");
            item.className = "categoria-item";
            item.setAttribute("role", "listitem");
            item.setAttribute("tabindex", "0");
            item.dataset.id = String(c.id);

            if (categoriaSeleccionada && categoriaSeleccionada.id === c.id) {
                item.classList.add("is-active");
            }

            const nombre = document.createElement("p");
            nombre.className = "categoria-nombre";
            nombre.textContent = c.nombreCategoria ?? "Categoría";

            const meta = document.createElement("div");
            meta.className = "categoria-meta";
            meta.innerHTML = `
        <div><b>ID:</b> ${c.id}</div>
        <div><b>Tipo:</b> ${c.tipoCategoria ?? "—"}</div>
        <div><b>Descripción:</b> ${c.descripcion ?? "—"}</div>
      `;

            item.appendChild(nombre);
            item.appendChild(meta);

            function seleccionar() {
                categoriaSeleccionada = c;
                if (inputCategoriaId) inputCategoriaId.value = String(c.id);
                actualizarBadgeCategoria(c);
                renderCategorias(categoriasDisponibles);
            }

            item.addEventListener("click", seleccionar);
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    seleccionar();
                }
            });

            categoriasScroll.appendChild(item);
        });
    }

    // =========================
    // 7) LOAD: categorías
    // =========================
    async function loadCategorias() {
        setMensaje(mensajeCategorias, "");
        setEstadoCategorias("Cargando categorías...", "info");

        try {
            const data = await fetchCategoriasTodas();

            if (!Array.isArray(data) || data.length === 0) {
                categoriasDisponibles = [];
                renderCategorias([]);
                setEstadoCategorias("No hay categorías disponibles.", "info");
                return;
            }

            categoriasDisponibles = data;

            // Mantener selección previa si sigue existiendo
            if (categoriaSeleccionada) {
                const sigue = categoriasDisponibles.find((c) => c.id === categoriaSeleccionada.id);
                if (!sigue) {
                    categoriaSeleccionada = null;
                    if (inputCategoriaId) inputCategoriaId.value = "";
                    actualizarBadgeCategoria(null);
                } else {
                    categoriaSeleccionada = sigue;
                }
            }

            renderCategorias(categoriasDisponibles);
            setEstadoCategorias(`${data.length} categoría(s) disponibles. Selecciona una.`, "ok");
        } catch (err) {
            console.error(err);
            categoriasDisponibles = [];
            renderCategorias([]);
            setEstadoCategorias(`Error cargando categorías: ${err.message}`, "error");
        }
    }

    // =========================
    // 8) SUBMIT
    // =========================
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        setMensaje(mensajeForm, "");

        const nombreCarrera = (inputNombreCarrera?.value ?? "").trim();
        const ubicacion = (inputUbicacion?.value ?? "").trim();
        const fechaEjecucionRaw = (inputFechaEjecucion?.value ?? "").trim(); // "YYYY-MM-DDTHH:mm"
        const nivelDificultad = (inputNivelDificultad?.value ?? "").trim();
        const paraQuien = (inputParaQuien?.value ?? "").trim();
        const categoriaId = categoriaSeleccionada?.id ?? null;

        // Validación
        if (!nombreCarrera || !ubicacion || !fechaEjecucionRaw || !nivelDificultad || !paraQuien) {
            setMensaje(mensajeForm, "Por favor completa todos los campos obligatorios (*).", "error");
            return;
        }

        if (!categoriaId) {
            setMensaje(mensajeForm, "Selecciona una categoría en el panel de arriba.", "error");
            return;
        }

        // El backend espera LocalDateTime: "YYYY-MM-DDTHH:mm:ss"
        // datetime-local entrega "YYYY-MM-DDTHH:mm", agregamos :00
        const fechaEjecucion = fechaEjecucionRaw.length === 16
            ? fechaEjecucionRaw + ":00"
            : fechaEjecucionRaw;

        // CarreraDTO exacto
        const payload = {
            nombreCarrera,
            ubicacion,
            fechaEjecucion,
            nivelDificultad,
            paraQuien,
            categoriaId,
        };

        console.log("CarreraDTO =>", payload);

        const btnCrear = document.getElementById("btn-crear");
        if (btnCrear) btnCrear.disabled = true;

        try {
            const creada = await fetchCrearCarrera(payload);
            console.log("CarreraResponse =>", creada);
            setMensaje(mensajeForm, `¡Carrera "${creada.nombreCarrera}" creada con éxito (ID: ${creada.id}).`, "ok");
            form.reset();
            categoriaSeleccionada = null;
            if (inputCategoriaId) inputCategoriaId.value = "";
            actualizarBadgeCategoria(null);
            renderCategorias(categoriasDisponibles);
        } catch (err) {
            console.error(err);
            setMensaje(mensajeForm, `No fue posible crear la carrera. ${err.message || ""}`.trim(), "error");
        } finally {
            if (btnCrear) btnCrear.disabled = false;
        }
    });

    // =========================
    // 9) EVENTOS
    // =========================
    const sessionUser = getSessionUser();
    if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";

    btnLogout?.addEventListener("click", () => {
        localStorage.removeItem("sessionUser");
        window.location.href = "index.html";
    });

    btnCategoriasRecargar?.addEventListener("click", loadCategorias);

    // =========================
    // 10) INIT
    // =========================
    loadCategorias();
});