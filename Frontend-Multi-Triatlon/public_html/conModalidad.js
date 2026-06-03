/**
 * conModalidad.js
 * ---------------
 * Maneja la consulta de triatletas filtrados por modalidad cross.
 * Se comunica con el microservicio de triatletas vía GET y renderiza
 * los resultados en una tabla dinámica dentro de la página.
 *
 * Microservicio involucrado:
 * - Triatleta: GET http://localhost:9091/api/triatletas/modalidad-cross?modalidadCross=true
 *
 * Campos mostrados: nombre, correo, fechaNacimiento, genero, activo,
 *                   urlFoto, categoriaEdad, modalidadCross, especialidad, carreraId
 * Campos omitidos:  id, identificacion (privacidad)
 */

document.addEventListener("DOMContentLoaded", () => {

  // ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
  // URL base del microservicio y endpoint de consulta por modalidad cross
  const API_TRIATLETA = "http://localhost:9091";
  const ENDPOINT      = `${API_TRIATLETA}/api/triatletas/modalidad-cross`;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  // Referencias a los elementos del HTML que se manipulan durante la interacción
  const btnLogout    = document.getElementById("btn-logout");
  const userNombreEl = document.getElementById("user-nombre");

  const form        = document.getElementById("form-modalidad");
  const selectCross = document.getElementById("modalidad-cross");
  const btnLimpiar  = document.getElementById("btn-limpiar");

  const mensaje        = document.getElementById("mensaje");
  const contador       = document.getElementById("contador");
  const resultadosWrap = document.getElementById("resultados-wrap");

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  /**
   * Lee y parsea el usuario de sesión guardado en localStorage.
   * @returns {Object|null} Objeto con datos del usuario, o null si no hay sesión.
   */
  function getSessionUser() {
    try {
      const raw = localStorage.getItem("sessionUser");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Muestra un mensaje de retroalimentación al usuario.
   * @param {string} texto - Texto a mostrar.
   * @param {"info"|"ok"|"error"} tipo - Define el color del mensaje.
   */
  function setMensaje(texto, tipo = "info") {
    if (!mensaje) return;
    mensaje.textContent = texto;
    if (tipo === "error") mensaje.style.color = "#8b1d1d";
    else if (tipo === "ok") mensaje.style.color = "#0A3323";
    else mensaje.style.color = "";
  }

  /**
   * Convierte un valor a string seguro para mostrarlo en la tabla.
   * Retorna "—" si el valor es null, undefined o vacío.
   * @param {*} value
   * @returns {string}
   */
  function safeText(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  /**
   * Convierte un booleano a texto legible en español.
   * @param {*} value
   * @returns {"Sí"|"No"|"—"}
   */
  function boolToSiNo(value) {
    if (value === true) return "Sí";
    if (value === false) return "No";
    return "—";
  }

  /** Vacía el contenedor de resultados. */
  function clearResultados() {
    if (resultadosWrap) resultadosWrap.innerHTML = "";
  }

  /**
   * Crea un elemento <img> para mostrar la foto del triatleta en miniatura.
   * Si la URL falla o está vacía, muestra un SVG de reemplazo con ícono de carrera.
   * @param {string} urlFoto - URL de la foto del triatleta.
   * @returns {HTMLImageElement}
   */
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

  // ─── FETCH ───────────────────────────────────────────────────────────────────

  /**
   * Consulta al backend los triatletas según su participación en modalidad cross.
   * Spring parsea el query param "true"/"false" directamente a Boolean.
   * Lanza un error si la respuesta HTTP no es exitosa.
   * @param {"true"|"false"} modalidadCrossStr - Valor del filtro como string.
   * @returns {Promise<Array>} Lista de objetos TriatletaResponse.
   */
  async function fetchTriatletasPorCross(modalidadCrossStr) {
    const url = `${ENDPOINT}?modalidadCross=${encodeURIComponent(modalidadCrossStr)}`;

    const resp = await fetch(url, { method: "GET" });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }

    return await resp.json();
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  /**
   * Construye y retorna una tabla HTML con los datos de los triatletas recibidos.
   * Cada fila representa un triatleta con sus campos visibles.
   * @param {Array} triatletas - Lista de objetos TriatletaResponse del backend.
   * @returns {HTMLDivElement} Contenedor con la tabla lista para insertar en el DOM.
   */
  function renderTablaTriatletas(triatletas) {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "table";

    const headers = [
      "Foto", "Nombre", "Correo", "Fecha nacimiento", "Género",
      "Activo", "Categoría", "Especialidad", "Cross", "Carrera ID",
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

  // ─── EVENTOS ─────────────────────────────────────────────────────────────────

  // Muestra el nombre del usuario logueado en el encabezado
  const sessionUser = getSessionUser();
  if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";

  // Cierra la sesión eliminando el usuario de localStorage y redirige al inicio
  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });

  // Limpia el formulario, los resultados y el contador al presionar "Limpiar"
  btnLimpiar?.addEventListener("click", () => {
    if (selectCross) selectCross.value = "";
    setMensaje("");
    clearResultados();
    if (contador) contador.textContent = "Aún no has consultado.";
  });

  /**
   * Al enviar el formulario, valida la selección, consulta el backend
   * y renderiza los resultados. El contador refleja el label legible
   * ("Sí"/"No") en lugar del valor booleano crudo.
   * Maneja casos de lista vacía y errores de red.
   */
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
      const label = modalidadCrossStr === "true" ? "Sí" : "No";

      if (!Array.isArray(triatletas) || triatletas.length === 0) {
        if (contador) contador.textContent = `0 resultados para Cross = "${label}".`;
        setMensaje("No se encontraron triatletas con ese filtro.", "info");
        return;
      }

      resultadosWrap.appendChild(renderTablaTriatletas(triatletas));
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