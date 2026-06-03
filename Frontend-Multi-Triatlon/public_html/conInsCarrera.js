/**
 * conInsCarrera.js
 * ----------------
 * Maneja la consulta de triatletas inscritos en una carrera específica.
 * Carga las carreras disponibles desde el microservicio Carrera, permite
 * seleccionar una y muestra sus inscritos en una tabla dinámica.
 *
 * Flujo:
 * 1) Al cargar la página, trae todas las carreras disponibles vía GET
 * 2) El usuario selecciona una carrera del scroll
 * 3) Al presionar "Consultar", trae los triatletas inscritos en esa carrera
 * 4) Renderiza los resultados en tabla
 *
 * Microservicios involucrados:
 * - Carrera: GET http://localhost:9092/api/carreras/todas
 * - Carrera: GET http://localhost:9092/api/carreras/{id}/triatletas
 *
 * Campos mostrados: nombre, correo, fechaNacimiento, genero, activo,
 *                   urlFoto, categoriaEdad, modalidadCross, especialidad, carreraId
 * Campos omitidos:  id, identificacion (privacidad)
 */

document.addEventListener("DOMContentLoaded", () => {

  // ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
  // URLs base y endpoints del microservicio Carrera
  const API_CARRERA             = "http://localhost:9092";
  const ENDPOINT_CARRERAS_TODAS = `${API_CARRERA}/api/carreras/todas`;
  const ENDPOINT_INSCRITOS      = (idCarrera) => `${API_CARRERA}/api/carreras/${idCarrera}/triatletas`;

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  // Referencias a los elementos del HTML que se manipulan durante la interacción
  const btnLogout           = document.getElementById("btn-logout");
  const userNombreEl        = document.getElementById("user-nombre");

  const btnCarrerasRecargar = document.getElementById("btn-carreras-recargar");
  const btnLimpiar          = document.getElementById("btn-limpiar");
  const btnConsultar        = document.getElementById("btn-consultar");

  const carrerasEstado      = document.getElementById("carreras-estado");
  const carrerasScroll      = document.getElementById("carreras-scroll");
  const inputCarreraId      = document.getElementById("carrera-id");

  const mensaje             = document.getElementById("mensaje");
  const contador            = document.getElementById("contador");
  const resultadosWrap      = document.getElementById("resultados-wrap");

  // ─── STATE ────────────────────────────────────────────────────────────────────
  // Lista de carreras cargadas y carrera actualmente seleccionada por el usuario
  let carrerasDisponibles = [];
  let carreraSeleccionada = null;

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
   * Muestra el estado de carga del scroll de carreras.
   * @param {string} texto - Texto a mostrar.
   * @param {"info"|"ok"|"error"} tipo - Define el color del mensaje.
   */
  function setEstadoCarreras(texto, tipo = "info") {
    if (!carrerasEstado) return;
    carrerasEstado.textContent = texto;
    if (tipo === "error") carrerasEstado.style.color = "#8b1d1d";
    else if (tipo === "ok") carrerasEstado.style.color = "#0A3323";
    else carrerasEstado.style.color = "";
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
   * Si la URL falla o está vacía, muestra un SVG de reemplazo con ícono de meta.
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
          <text x="50%" y="52%" text-anchor="middle" font-size="26" fill="#105666">🏁</text>
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
   * Consulta al microservicio Carrera la lista completa de carreras disponibles.
   * Lanza un error si la respuesta HTTP no es exitosa.
   * @returns {Promise<Array>} Lista de objetos CarreraResponse.
   */
  async function fetchCarrerasTodas() {
    const resp = await fetch(ENDPOINT_CARRERAS_TODAS, { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  /**
   * Consulta al microservicio Carrera los triatletas inscritos en una carrera.
   * Lanza un error si la respuesta HTTP no es exitosa.
   * @param {string|number} idCarrera - ID de la carrera a consultar.
   * @returns {Promise<Array>} Lista de objetos TriatletaResponse.
   */
  async function fetchInscritos(idCarrera) {
    const resp = await fetch(ENDPOINT_INSCRITOS(idCarrera), { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  // ─── RENDER: scroll de carreras ───────────────────────────────────────────────

  /**
   * Construye el scroll de carreras con los datos recibidos.
   * Marca visualmente la carrera seleccionada y habilita el botón Consultar
   * al elegir una. Limpia resultados anteriores al cambiar la selección.
   * @param {Array} lista - Lista de objetos CarreraResponse.
   */
  function renderCarreras(lista) {
    if (!carrerasScroll) return;
    carrerasScroll.innerHTML = "";

    lista.forEach((c) => {
      const item = document.createElement("div");
      item.className = "carrera-item";
      item.setAttribute("role", "listitem");
      item.setAttribute("tabindex", "0");
      item.dataset.id = String(c.id);

      if (carreraSeleccionada && carreraSeleccionada.id === c.id) item.classList.add("is-active");

      const nombre = document.createElement("p");
      nombre.className = "carrera-nombre";
      nombre.textContent = c.nombreCarrera ?? "Carrera";

      const meta = document.createElement("div");
      meta.className = "carrera-meta";
      meta.innerHTML = `
        <div><b>ID:</b> ${c.id}</div>
        <div><b>Ubicación:</b> ${c.ubicacion ?? "—"}</div>
        <div><b>Fecha:</b> ${c.fechaEjecucion ?? "—"}</div>
        <div><b>Dificultad:</b> ${c.nivelDificultad ?? "—"}</div>
      `;

      item.appendChild(nombre);
      item.appendChild(meta);

      function seleccionar() {
        carreraSeleccionada = c;
        if (inputCarreraId) inputCarreraId.value = String(c.id);
        if (btnConsultar) btnConsultar.disabled = false;
        renderCarreras(carrerasDisponibles);
        clearResultados();
        if (contador) contador.textContent = `Carrera seleccionada: ${safeText(c.nombreCarrera)} (ID: ${c.id}).`;
      }

      item.addEventListener("click", seleccionar);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(); }
      });

      carrerasScroll.appendChild(item);
    });
  }

  // ─── RENDER: tabla de triatletas inscritos ────────────────────────────────────

  /**
   * Construye y retorna una tabla HTML con los datos de los triatletas inscritos.
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

  // ─── CARGA DE CARRERAS ────────────────────────────────────────────────────────

  /**
   * Carga las carreras desde el microservicio y actualiza el scroll.
   * Si ya había una carrera seleccionada, intenta mantenerla si sigue disponible.
   * Deshabilita el botón Consultar si no hay carreras o se pierde la selección.
   */
  async function loadCarreras() {
    setMensaje("");
    setEstadoCarreras("Cargando carreras...", "info");

    try {
      const data = await fetchCarrerasTodas();

      if (!Array.isArray(data) || data.length === 0) {
        carrerasDisponibles = [];
        renderCarreras([]);
        setEstadoCarreras("No hay carreras disponibles.", "info");
        if (btnConsultar) btnConsultar.disabled = true;
        return;
      }

      carrerasDisponibles = data;

      // Mantener selección previa si la carrera sigue existiendo tras recargar
      if (carreraSeleccionada) {
        const sigue = carrerasDisponibles.find((c) => c.id === carreraSeleccionada.id);
        if (!sigue) {
          carreraSeleccionada = null;
          if (inputCarreraId) inputCarreraId.value = "";
          if (btnConsultar) btnConsultar.disabled = true;
        } else {
          carreraSeleccionada = sigue;
          if (inputCarreraId) inputCarreraId.value = String(sigue.id);
          if (btnConsultar) btnConsultar.disabled = false;
        }
      }

      renderCarreras(carrerasDisponibles);
      setEstadoCarreras(`${data.length} carrera(s) disponibles. Selecciona una.`, "ok");
    } catch (err) {
      console.error(err);
      carrerasDisponibles = [];
      renderCarreras([]);
      setEstadoCarreras(`Error cargando carreras: ${err.message}`, "error");
      if (btnConsultar) btnConsultar.disabled = true;
    }
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

  // Recarga la lista de carreras desde el microservicio
  btnCarrerasRecargar?.addEventListener("click", loadCarreras);

  // Limpia la selección de carrera, los resultados y el contador
  btnLimpiar?.addEventListener("click", () => {
    setMensaje("");
    clearResultados();
    carreraSeleccionada = null;
    if (inputCarreraId) inputCarreraId.value = "";
    if (btnConsultar) btnConsultar.disabled = true;
    renderCarreras(carrerasDisponibles);
    if (contador) contador.textContent = "Aún no has consultado.";
  });

  /**
   * Al presionar "Consultar", verifica que haya una carrera seleccionada,
   * consulta sus inscritos al backend y renderiza los resultados en tabla.
   * Maneja casos de lista vacía y errores de red.
   */
  btnConsultar?.addEventListener("click", async () => {
    setMensaje("");

    const idCarrera = (inputCarreraId?.value ?? "").trim();
    if (!idCarrera) {
      setMensaje("Selecciona una carrera primero.", "error");
      return;
    }

    clearResultados();
    if (contador) contador.textContent = "Consultando inscritos...";

    try {
      const triatletas = await fetchInscritos(idCarrera);

      if (!Array.isArray(triatletas) || triatletas.length === 0) {
        if (contador) contador.textContent = `0 triatletas inscritos en la carrera ID ${idCarrera}.`;
        setMensaje("No hay triatletas inscritos en esta carrera.", "info");
        return;
      }

      resultadosWrap.appendChild(renderTablaTriatletas(triatletas));
      if (contador) contador.textContent = `${triatletas.length} triatleta(s) inscritos en la carrera ID ${idCarrera}.`;
      setMensaje("Consulta realizada correctamente.", "ok");
    } catch (err) {
      console.error(err);
      clearResultados();
      if (contador) contador.textContent = "Ocurrió un error al consultar.";
      setMensaje(`No fue posible consultar inscritos. ${err?.message || ""}`.trim(), "error");
    }
  });

  // ─── INIT ─────────────────────────────────────────────────────────────────────
  // Carga las carreras disponibles al entrar a la página
  loadCarreras();
});