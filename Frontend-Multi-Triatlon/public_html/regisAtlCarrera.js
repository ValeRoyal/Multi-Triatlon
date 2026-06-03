/**
 * regisAtlCarrera.js
 * ------------------
 * Objetivo de esta pantalla:
 * 1) Consultar TODAS las carreras disponibles desde el microservicio Carrera:
 *      GET http://localhost:9092/api/carreras/todas
 * 2) Mostrar esas carreras en una tabla.
 * 3) Permitir seleccionar UNA carrera.
 * 4) Preparar (NO ejecutar) los datos para inscribir al triatleta:
 *      PATCH http://localhost:9091/api/triatletas/{idTriatleta}/registrar-en-carrera/{idCarrera}
 *
 * Importante:
 * - Para hacer el PATCH real, necesitas el idTriatleta.
 *   En el front, normalmente lo obtienes consultando al triatleta en backend.
 *
 * ¿Qué hacemos aquí?
 * - Usamos localStorage.sessionUser para mostrar quién está logueado.
 * - Si sessionUser trae "id" lo usamos.
 * - Si no trae "id", dejamos el objeto listo pero marcamos que falta idTriatleta.
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) CONFIGURACIÓN DE APIS
  // =========================
  const API_CARRERA = "http://localhost:9092";
  const API_TRIATLETA = "http://localhost:9091";

  const ENDPOINT_CARRERAS_TODAS = `${API_CARRERA}/api/carreras/todas`;

  // Este es el patrón del endpoint de inscripción (lo armamos luego)
  const ENDPOINT_REGISTRO = (idTriatleta, idCarrera) =>
    `${API_TRIATLETA}/api/triatletas/${idTriatleta}/registrar-en-carrera/${idCarrera}`;
  const ENDPOINT_TRIATLETA_IDENTIFICACION = (identificacion) =>
    `${API_TRIATLETA}/api/triatletas/identificacion/${encodeURIComponent(identificacion)}`;

  // =========================
  // 2) DOM
  // =========================
  const btnLogout = document.getElementById("btn-logout");
  const userNombreEl = document.getElementById("user-nombre");

  const contador = document.getElementById("contador");
  const mensaje = document.getElementById("mensaje");
  const tablaWrap = document.getElementById("tabla-wrap");

  const btnRecargar = document.getElementById("btn-recargar");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const triatletaInfo = document.getElementById("triatleta-info");
  const carreraInfo = document.getElementById("carrera-info");
  const btnInscribirme = document.getElementById("btn-inscribirme");

  // =========================
  // 3) ESTADO (state)
  // =========================
  let carreras = []; // lista completa
  let carreraSeleccionada = null; // una sola carrera

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

  function setMensaje(texto, tipo = "info") {
    if (!mensaje) return;
    mensaje.textContent = texto;
    if (tipo === "error") mensaje.style.color = "#8b1d1d";
    else if (tipo === "ok") mensaje.style.color = "#0A3323";
    else mensaje.style.color = "";
  }

  function safeText(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  // =========================
  // 5) FETCH: carreras
  // =========================
  async function fetchCarrerasTodas() {
    const resp = await fetch(ENDPOINT_CARRERAS_TODAS, { method: "GET" });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }

    return await resp.json(); // List<CarreraResponse>
  }

  async function fetchTriatletaPorIdentificacion(identificacion) {
    const resp = await fetch(ENDPOINT_TRIATLETA_IDENTIFICACION(identificacion), { method: "GET" });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  async function registrarTriatletaEnCarrera(idTriatleta, idCarrera) {
    const resp = await fetch(ENDPOINT_REGISTRO(idTriatleta, idCarrera), { method: "PATCH" });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  // =========================
  // 6) RENDER: tabla de carreras
  // =========================
  function clearTabla() {
    if (tablaWrap) tablaWrap.innerHTML = "";
  }

  function renderTablaCarreras(lista) {
    /**
     * Renderizamos una tabla porque:
     * - Hay varias carreras y es fácil comparar.
     * - Permite incluir un botón “Seleccionar” por fila.
     */
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "table";

    const headers = [
      "Acción",
      "ID",
      "Nombre",
      "Ubicación",
      "Fecha ejecución",
      "Dificultad",
      "Para quién",
    ];

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    headers.forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    const tbody = document.createElement("tbody");

    lista.forEach((c) => {
      const tr = document.createElement("tr");
      tr.dataset.carreraId = String(c?.id ?? "");

      // Si esta fila corresponde a la carrera seleccionada, la marcamos visualmente
      if (carreraSeleccionada && c?.id === carreraSeleccionada.id) {
        tr.classList.add("row-selected");
      }

      // Acción: botón seleccionar
      const tdAccion = document.createElement("td");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost btn-select";
      btn.textContent = "Seleccionar";
      btn.addEventListener("click", () => seleccionarCarrera(c));
      tdAccion.appendChild(btn);
      tr.appendChild(tdAccion);

      // Columnas de datos
      const tdId = document.createElement("td");
      tdId.textContent = safeText(c?.id);
      tr.appendChild(tdId);

      const tdNombre = document.createElement("td");
      tdNombre.textContent = safeText(c?.nombreCarrera);
      tr.appendChild(tdNombre);

      const tdUbic = document.createElement("td");
      tdUbic.textContent = safeText(c?.ubicacion);
      tr.appendChild(tdUbic);

      const tdFecha = document.createElement("td");
      // Puede venir como ISO / con segundos, lo dejamos tal cual para no romper
      tdFecha.textContent = safeText(c?.fechaEjecucion);
      tr.appendChild(tdFecha);

      const tdDif = document.createElement("td");
      tdDif.textContent = safeText(c?.nivelDificultad);
      tr.appendChild(tdDif);

      const tdPara = document.createElement("td");
      tdPara.textContent = safeText(c?.paraQuien);
      tr.appendChild(tdPara);

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  // =========================
  // 7) SELECCIÓN + CONFIRMACIÓN
  // =========================
  function seleccionarCarrera(carrera) {
    carreraSeleccionada = carrera;

    // Pintamos info abajo
    if (carreraInfo) {
      const label = carreraSeleccionada
        ? `${safeText(carreraSeleccionada.nombreCarrera)} (ID: ${safeText(carreraSeleccionada.id)})`
        : "Ninguna";
      carreraInfo.value = label;
    }

    // Activamos botón de “inscribirme” si hay carrera
    if (btnInscribirme) btnInscribirme.disabled = !carreraSeleccionada;

    // Re-render para marcar fila seleccionada
    refreshTabla();
  }

  function limpiarSeleccion() {
    carreraSeleccionada = null;
    if (carreraInfo) carreraInfo.value = "Ninguna";
    if (btnInscribirme) btnInscribirme.disabled = true;
    refreshTabla();
  }

  function refreshTabla() {
    clearTabla();
    if (!Array.isArray(carreras) || carreras.length === 0) return;
    tablaWrap.appendChild(renderTablaCarreras(carreras));
  }

  // =========================
  // 8) ACCIÓN FINAL: registrar en carrera
  // =========================
  async function resolverTriatletaActual() {
    const sessionUser = getSessionUser();

    if (sessionUser?.id) return sessionUser;
    if (!sessionUser?.identificacion) {
      throw new Error("No hay una sesión válida para identificar al triatleta.");
    }

    const triatleta = await fetchTriatletaPorIdentificacion(sessionUser.identificacion);
    localStorage.setItem("sessionUser", JSON.stringify({
      ...sessionUser,
      id: triatleta.id,
      nombre: triatleta.nombre,
      identificacion: triatleta.identificacion,
      correo: triatleta.correo,
    }));

    return triatleta;
  }

  async function registrarSeleccion() {
    const idCarrera = carreraSeleccionada?.id ?? null;

    if (!idCarrera) {
      setMensaje("Primero selecciona una carrera.", "error");
      return;
    }

    if (btnInscribirme) btnInscribirme.disabled = true;
    setMensaje("Registrando inscripción...", "info");

    try {
      const triatleta = await resolverTriatletaActual();
      const actualizado = await registrarTriatletaEnCarrera(triatleta.id, idCarrera);

      localStorage.setItem("sessionUser", JSON.stringify({
        id: actualizado.id ?? triatleta.id,
        nombre: actualizado.nombre ?? triatleta.nombre,
        identificacion: actualizado.identificacion ?? triatleta.identificacion,
        correo: actualizado.correo ?? triatleta.correo,
      }));

      setMensaje(`Inscripción confirmada en "${safeText(carreraSeleccionada.nombreCarrera)}".`, "ok");
    } catch (err) {
      console.error(err);
      setMensaje(`No fue posible inscribirte. ${err?.message || ""}`.trim(), "error");
    } finally {
      if (btnInscribirme) btnInscribirme.disabled = !carreraSeleccionada;
    }
  }

  // =========================
  // 9) INICIALIZACIÓN + EVENTOS
  // =========================
  const sessionUser = getSessionUser();
  if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";

  if (triatletaInfo) {
    const label = sessionUser
      ? `${safeText(sessionUser.nombre)} (${safeText(sessionUser.correo)})`
      : "No hay sesión";
    triatletaInfo.value = label;
  }

  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });

  btnRecargar?.addEventListener("click", () => loadCarreras());
  btnLimpiar?.addEventListener("click", () => {
    setMensaje("");
    limpiarSeleccion();
  });

  btnInscribirme?.addEventListener("click", () => {
    if (!carreraSeleccionada) {
      setMensaje("Primero selecciona una carrera.", "error");
      return;
    }
    registrarSeleccion();
  });

  async function loadCarreras() {
    setMensaje("");
    if (contador) contador.textContent = "Cargando carreras...";
    clearTabla();

    try {
      const data = await fetchCarrerasTodas();

      if (!Array.isArray(data) || data.length === 0) {
        carreras = [];
        if (contador) contador.textContent = "0 carreras disponibles.";
        setMensaje("No hay carreras registradas en este momento.", "info");
        return;
      }

      carreras = data;
      if (contador) contador.textContent = `${carreras.length} carrera(s) disponibles.`;

      refreshTabla();
      setMensaje("Carreras cargadas correctamente.", "ok");
    } catch (err) {
      console.error(err);
      carreras = [];
      if (contador) contador.textContent = "Error al cargar carreras.";
      setMensaje(`No fue posible cargar carreras. ${err?.message || ""}`.trim(), "error");
    }
  }

  // Cargar automáticamente al entrar
  loadCarreras();
});
