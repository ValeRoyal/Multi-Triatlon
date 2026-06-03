/**
 * conModalidad.js
 * --------------
 * Objetivo:
 * - Consultar triatletas por modalidad cross (true/false)
 *
 * Endpoint (Triatleta):
 *   GET http://localhost:9091/api/triatletas/modalidad-cross?modalidadCross=true
 *
 * Privacidad:
 * - NO mostramos: id, identificacion
 * - SÍ mostramos: nombre, correo, fechaNacimiento, genero, activo, urlFoto,
 *                categoriaEdad, modalidadCross, especialidad, carreraId
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) CONFIG
  // =========================
  const API_TRIATLETA = "http://localhost:9091";
  const ENDPOINT = `${API_TRIATLETA}/api/triatletas/modalidad-cross`;

  // =========================
  // 2) DOM
  // =========================
  const btnLogout = document.getElementById("btn-logout");
  const userNombreEl = document.getElementById("user-nombre");

  const form = document.getElementById("form-modalidad");
  const selectCross = document.getElementById("modalidad-cross");
  const btnLimpiar = document.getElementById("btn-limpiar");

  const mensaje = document.getElementById("mensaje");
  const contador = document.getElementById("contador");
  const resultadosWrap = document.getElementById("resultados-wrap");

  // =========================
  // 3) HELPERS
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

  function boolToSiNo(value) {
    if (value === true) return "Sí";
    if (value === false) return "No";
    return "—";
  }

  function clearResultados() {
    if (resultadosWrap) resultadosWrap.innerHTML = "";
  }

  function createFotoMini(urlFoto) {
    const img = document.createElement("img");
    img.className = "foto-mini";
    img.alt = "Foto";

    const fallback =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
          <rect width="100%" height="100%" fill="#F7F4D5"/>
          <text x="50%" y="52%" text-anchor="middle" font-size="26" fill="#105666">🏃</text>
        </svg>`
      );

    img.src = urlFoto ? urlFoto : fallback;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => (img.src = fallback));
    return img;
  }

  // =========================
  // 4) FETCH
  // =========================
  async function fetchTriatletasPorCross(modalidadCrossStr) {
    /**
     * modalidadCrossStr es "true" o "false".
     * El endpoint espera Boolean en query param (Spring lo parsea).
     */
    const url = `${ENDPOINT}?modalidadCross=${encodeURIComponent(modalidadCrossStr)}`;

    const resp = await fetch(url, { method: "GET" });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  // =========================
  // 5) RENDER TABLA
  // =========================
  function renderTablaTriatletas(triatletas) {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "table";

    const headers = [
      "Foto",
      "Nombre",
      "Correo",
      "Fecha nacimiento",
      "Género",
      "Activo",
      "Categoría",
      "Especialidad",
      "Cross",
      "Carrera ID",
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

    triatletas.forEach((t) => {
      const tr = document.createElement("tr");

      const tdFoto = document.createElement("td");
      tdFoto.appendChild(createFotoMini(t?.urlFoto));
      tr.appendChild(tdFoto);

      const tdNombre = document.createElement("td");
      tdNombre.textContent = safeText(t?.nombre);
      tr.appendChild(tdNombre);

      const tdCorreo = document.createElement("td");
      tdCorreo.textContent = safeText(t?.correo);
      tr.appendChild(tdCorreo);

      const tdFecha = document.createElement("td");
      tdFecha.textContent = safeText(t?.fechaNacimiento);
      tr.appendChild(tdFecha);

      const tdGenero = document.createElement("td");
      tdGenero.textContent = safeText(t?.genero);
      tr.appendChild(tdGenero);

      const tdActivo = document.createElement("td");
      tdActivo.textContent = boolToSiNo(t?.activo);
      tr.appendChild(tdActivo);

      const tdCategoria = document.createElement("td");
      tdCategoria.textContent = safeText(t?.categoriaEdad);
      tr.appendChild(tdCategoria);

      const tdEspecialidad = document.createElement("td");
      tdEspecialidad.textContent = safeText(t?.especialidad);
      tr.appendChild(tdEspecialidad);

      const tdCross = document.createElement("td");
      tdCross.textContent = boolToSiNo(t?.modalidadCross);
      tr.appendChild(tdCross);

      const tdCarreraId = document.createElement("td");
      tdCarreraId.textContent = t?.carreraId ? String(t.carreraId) : "—";
      tr.appendChild(tdCarreraId);

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  // =========================
  // 6) EVENTOS
  // =========================
  const sessionUser = getSessionUser();
  if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";

  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });

  btnLimpiar?.addEventListener("click", () => {
    if (selectCross) selectCross.value = "";
    setMensaje("");
    clearResultados();
    if (contador) contador.textContent = "Aún no has consultado.";
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMensaje("");

    const modalidadCrossStr = (selectCross?.value ?? "").trim(); // "true" | "false"
    if (!modalidadCrossStr) {
      setMensaje("Selecciona Sí o No para consultar.", "error");
      return;
    }

    clearResultados();
    if (contador) contador.textContent = "Consultando...";

    try {
      const triatletas = await fetchTriatletasPorCross(modalidadCrossStr);

      if (!Array.isArray(triatletas) || triatletas.length === 0) {
        const label = modalidadCrossStr === "true" ? "Sí" : "No";
        if (contador) contador.textContent = `0 resultados para Cross = "${label}".`;
        setMensaje("No se encontraron triatletas con ese filtro.", "info");
        return;
      }

      resultadosWrap.appendChild(renderTablaTriatletas(triatletas));

      const label = modalidadCrossStr === "true" ? "Sí" : "No";
      if (contador) contador.textContent = `${triatletas.length} resultado(s) para Cross = "${label}".`;
      setMensaje("Consulta realizada correctamente.", "ok");
    } catch (err) {
      console.error(err);
      clearResultados();
      if (contador) contador.textContent = "Ocurrió un error al consultar.";
      setMensaje(`No fue posible consultar. ${err?.message || ""}`.trim(), "error");
    }
  });
});