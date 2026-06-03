/**
 * elimAtCarrera.js
 * ----------------
 * Objetivo:
 * - Quitar (eliminar) un triatleta de una carrera.
 *
 * Endpoints disponibles (microservicio Carrera):
 * 1) Listar carreras:
 *      GET http://localhost:9092/api/carreras/todas
 * 2) Listar triatletas inscritos en una carrera:
 *      GET http://localhost:9092/api/carreras/{id}/triatletas
 * 3) Eliminar triatleta de carrera (relación):
 *      DELETE http://localhost:9092/api/carreras/{idCarrera}/eliminar-de-carrera/{idTriatleta}
 *
 * Lo que hace esta pantalla:
 * - Carga carreras "frescas"
 * - El usuario selecciona una carrera
 * - Consulta inscritos (triatletas) de esa carrera
 * - El usuario selecciona un triatleta
 * - Prepara el DELETE (NO lo ejecuta automáticamente)
 *   -> deja el objeto listo en window.__elimAtletaCarrera
 *
 * Privacidad:
 * - NO mostramos identificacion (sensible)
 * - En este caso: necesitamos el "id" del triatleta para el endpoint DELETE.
 *   Por eso, el id se usa internamente pero NO se muestra en la UI.
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) CONFIG
  // =========================
  const API_CARRERA = "http://localhost:9092";
  const ENDPOINT_CARRERAS_TODAS = `${API_CARRERA}/api/carreras/todas`;
  const ENDPOINT_INSCRITOS = (idCarrera) => `${API_CARRERA}/api/carreras/${idCarrera}/triatletas`;
  const ENDPOINT_DELETE = (idCarrera, idTriatleta) =>
    `${API_CARRERA}/api/carreras/${idCarrera}/eliminar-de-carrera/${idTriatleta}`;

  // =========================
  // 2) DOM
  // =========================
  const btnLogout = document.getElementById("btn-logout");
  const userNombreEl = document.getElementById("user-nombre");

  const btnCarrerasRecargar = document.getElementById("btn-carreras-recargar");
  const btnLimpiar = document.getElementById("btn-limpiar");
  const btnConsultarInscritos = document.getElementById("btn-consultar-inscritos");

  const carrerasEstado = document.getElementById("carreras-estado");
  const carrerasScroll = document.getElementById("carreras-scroll");
  const inputCarreraId = document.getElementById("carrera-id");

  const mensaje = document.getElementById("mensaje");
  const contadorInscritos = document.getElementById("contador-inscritos");
  const inscritosWrap = document.getElementById("inscritos-wrap");

  const carreraInfo = document.getElementById("carrera-info");
  const atletaInfo = document.getElementById("atleta-info");
  const btnPrepararDelete = document.getElementById("btn-preparar-delete");

  // =========================
  // 3) STATE
  // =========================
  let carrerasDisponibles = [];
  let carreraSeleccionada = null;

  let inscritos = [];
  let triatletaSeleccionado = null;

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

  function setEstadoCarreras(texto, tipo = "info") {
    if (!carrerasEstado) return;
    carrerasEstado.textContent = texto;
    if (tipo === "error") carrerasEstado.style.color = "#8b1d1d";
    else if (tipo === "ok") carrerasEstado.style.color = "#0A3323";
    else carrerasEstado.style.color = "";
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

  function clearInscritos() {
    inscritos = [];
    triatletaSeleccionado = null;
    if (inscritosWrap) inscritosWrap.innerHTML = "";
    if (contadorInscritos) contadorInscritos.textContent = "Aún no has consultado inscritos.";

    if (atletaInfo) atletaInfo.value = "Ninguno";
    if (btnPrepararDelete) btnPrepararDelete.disabled = true;
  }

  function updateConfirmBox() {
    if (carreraInfo) {
      carreraInfo.value = carreraSeleccionada
        ? `${safeText(carreraSeleccionada.nombreCarrera)} (ID: ${safeText(carreraSeleccionada.id)})`
        : "Ninguna";
    }

    if (atletaInfo) {
      atletaInfo.value = triatletaSeleccionado
        ? `${safeText(triatletaSeleccionado.nombre)} (${safeText(triatletaSeleccionado.correo)})`
        : "Ninguno";
    }

    // Solo habilitamos preparar delete cuando hay ambos seleccionados
    if (btnPrepararDelete) btnPrepararDelete.disabled = !(carreraSeleccionada && triatletaSeleccionado);
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
          <text x="50%" y="52%" text-anchor="middle" font-size="26" fill="#105666">👤</text>
        </svg>`
      );

    img.src = urlFoto ? urlFoto : fallback;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => (img.src = fallback));
    return img;
  }

  // =========================
  // 5) FETCH
  // =========================
  async function fetchCarrerasTodas() {
    const resp = await fetch(ENDPOINT_CARRERAS_TODAS, { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  async function fetchInscritos(idCarrera) {
    const resp = await fetch(ENDPOINT_INSCRITOS(idCarrera), { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.json(); // List<TriatletaResponse>
  }

  async function deleteTriatletaDeCarrera(idCarrera, idTriatleta) {
    const resp = await fetch(ENDPOINT_DELETE(idCarrera, idTriatleta), { method: "DELETE" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
  }

  // =========================
  // 6) RENDER: carreras scroll
  // =========================
  function renderCarreras(lista) {
    if (!carrerasScroll) return;
    carrerasScroll.innerHTML = "";

    lista.forEach((c) => {
      const item = document.createElement("div");
      item.className = "carrera-item";
      item.setAttribute("role", "listitem");
      item.setAttribute("tabindex", "0");
      item.dataset.id = String(c.id);

      if (carreraSeleccionada && carreraSeleccionada.id === c.id) {
        item.classList.add("is-active");
      }

      const nombre = document.createElement("p");
      nombre.className = "carrera-nombre";
      nombre.textContent = c.nombreCarrera ?? "Carrera";

      const meta = document.createElement("div");
      meta.className = "carrera-meta";
      meta.innerHTML = `
        <div><b>ID:</b> ${c.id}</div>
        <div><b>Ubicación:</b> ${c.ubicacion ?? "—"}</div>
        <div><b>Fecha:</b> ${c.fechaEjecucion ?? "—"}</div>
      `;

      item.appendChild(nombre);
      item.appendChild(meta);

      function seleccionar() {
        carreraSeleccionada = c;
        if (inputCarreraId) inputCarreraId.value = String(c.id);

        // Habilitamos botón para consultar inscritos
        if (btnConsultarInscritos) btnConsultarInscritos.disabled = false;

        // Cambiar carrera implica limpiar inscritos anteriores
        clearInscritos();
        updateConfirmBox();

        // Re-render para marcar selección
        renderCarreras(carrerasDisponibles);
      }

      item.addEventListener("click", seleccionar);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          seleccionar();
        }
      });

      carrerasScroll.appendChild(item);
    });
  }

  // =========================
  // 7) RENDER: tabla inscritos (para seleccionar triatleta)
  // =========================
  function renderTablaInscritos(lista) {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "table";

    // Nota: NO mostramos identificacion.
    // El "id" NO se muestra, pero se usa para poder hacer el DELETE.
    const headers = [
      "Acción",
      "Foto",
      "Nombre",
      "Correo",
      "Género",
      "Activo",
      "Categoría",
      "Especialidad",
      "Cross",
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

    lista.forEach((t) => {
      const tr = document.createElement("tr");
      tr.dataset.triatletaId = String(t?.id ?? "");

      if (triatletaSeleccionado && t?.id === triatletaSeleccionado.id) {
        tr.classList.add("row-selected");
      }

      // Acción: seleccionar
      const tdAccion = document.createElement("td");
      const btnSel = document.createElement("button");
      btnSel.type = "button";
      btnSel.className = "btn btn-ghost";
      btnSel.textContent = "Seleccionar";
      btnSel.addEventListener("click", () => seleccionarTriatleta(t));
      tdAccion.appendChild(btnSel);
      tr.appendChild(tdAccion);

      const tdFoto = document.createElement("td");
      tdFoto.appendChild(createFotoMini(t?.urlFoto));
      tr.appendChild(tdFoto);

      const tdNombre = document.createElement("td");
      tdNombre.textContent = safeText(t?.nombre);
      tr.appendChild(tdNombre);

      const tdCorreo = document.createElement("td");
      tdCorreo.textContent = safeText(t?.correo);
      tr.appendChild(tdCorreo);

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

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function seleccionarTriatleta(t) {
    // Guardamos el triatleta completo, pero en UI solo mostramos nombre/correo
    triatletaSeleccionado = t;
    updateConfirmBox();

    // Re-render tabla para marcar fila seleccionada
    if (inscritosWrap) {
      inscritosWrap.innerHTML = "";
      inscritosWrap.appendChild(renderTablaInscritos(inscritos));
    }
  }

  // =========================
  // 8) EJECUTAR DELETE
  // =========================
  async function ejecutarDelete() {
    if (!carreraSeleccionada || !triatletaSeleccionado) {
      setMensaje("Selecciona carrera y atleta antes de eliminar.", "error");
      return;
    }

    const idCarrera = carreraSeleccionada.id;
    const idTriatleta = triatletaSeleccionado.id;
    const nombreTriatleta = safeText(triatletaSeleccionado.nombre);

    if (btnPrepararDelete) btnPrepararDelete.disabled = true;
    setMensaje("Eliminando inscripción...", "info");

    try {
      await deleteTriatletaDeCarrera(idCarrera, idTriatleta);

      inscritos = inscritos.filter((t) => t?.id !== idTriatleta);
      triatletaSeleccionado = null;
      updateConfirmBox();

      if (inscritosWrap) {
        inscritosWrap.innerHTML = "";
        if (inscritos.length > 0) {
          inscritosWrap.appendChild(renderTablaInscritos(inscritos));
        }
      }

      if (contadorInscritos) {
        contadorInscritos.textContent =
          inscritos.length > 0
            ? `${inscritos.length} inscrito(s) en la carrera ID ${idCarrera}.`
            : `0 inscritos en carrera ID ${idCarrera}.`;
      }

      setMensaje(`Inscripción de ${nombreTriatleta} eliminada correctamente.`, "ok");
    } catch (err) {
      console.error(err);
      setMensaje(`No fue posible eliminar la inscripción. ${err?.message || ""}`.trim(), "error");
      updateConfirmBox();
    }
  }

  // =========================
  // 9) LOAD carreras
  // =========================
  async function loadCarreras() {
    setMensaje("");
    setEstadoCarreras("Cargando carreras...", "info");

    try {
      const data = await fetchCarrerasTodas();

      if (!Array.isArray(data) || data.length === 0) {
        carrerasDisponibles = [];
        renderCarreras([]);
        setEstadoCarreras("No hay carreras disponibles.", "info");
        if (btnConsultarInscritos) btnConsultarInscritos.disabled = true;
        return;
      }

      carrerasDisponibles = data;

      // Mantener selección si aún existe
      if (carreraSeleccionada) {
        const sigue = carrerasDisponibles.find((c) => c.id === carreraSeleccionada.id);
        if (!sigue) {
          carreraSeleccionada = null;
          if (inputCarreraId) inputCarreraId.value = "";
          if (btnConsultarInscritos) btnConsultarInscritos.disabled = true;
          clearInscritos();
        } else {
          carreraSeleccionada = sigue;
          if (inputCarreraId) inputCarreraId.value = String(sigue.id);
          if (btnConsultarInscritos) btnConsultarInscritos.disabled = false;
        }
      }

      renderCarreras(carrerasDisponibles);
      setEstadoCarreras(`${data.length} carrera(s) disponibles. Selecciona una.`, "ok");
      updateConfirmBox();
    } catch (err) {
      console.error(err);
      carrerasDisponibles = [];
      renderCarreras([]);
      setEstadoCarreras(`Error cargando carreras: ${err.message}`, "error");
      if (btnConsultarInscritos) btnConsultarInscritos.disabled = true;
    }
  }

  // =========================
  // 10) EVENTOS
  // =========================
  const sessionUser = getSessionUser();
  if (userNombreEl) userNombreEl.textContent = sessionUser?.nombre?.trim() || "Atleta";

  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });

  btnCarrerasRecargar?.addEventListener("click", loadCarreras);

  btnLimpiar?.addEventListener("click", () => {
    setMensaje("");

    carreraSeleccionada = null;
    if (inputCarreraId) inputCarreraId.value = "";
    if (btnConsultarInscritos) btnConsultarInscritos.disabled = true;

    clearInscritos();
    updateConfirmBox();

    renderCarreras(carrerasDisponibles);
  });

  btnConsultarInscritos?.addEventListener("click", async () => {
    setMensaje("");

    const idCarrera = (inputCarreraId?.value ?? "").trim();
    if (!idCarrera) {
      setMensaje("Selecciona una carrera primero.", "error");
      return;
    }

    clearInscritos();
    if (contadorInscritos) contadorInscritos.textContent = "Consultando inscritos...";

    try {
      const data = await fetchInscritos(idCarrera);

      if (!Array.isArray(data) || data.length === 0) {
        inscritos = [];
        if (contadorInscritos) contadorInscritos.textContent = `0 inscritos en carrera ID ${idCarrera}.`;
        setMensaje("No hay triatletas inscritos en esta carrera.", "info");
        return;
      }

      inscritos = data;

      if (contadorInscritos) contadorInscritos.textContent = `${inscritos.length} inscrito(s) en la carrera ID ${idCarrera}.`;
      if (inscritosWrap) {
        inscritosWrap.innerHTML = "";
        inscritosWrap.appendChild(renderTablaInscritos(inscritos));
      }

      setMensaje("Inscritos cargados. Selecciona un atleta para quitar.", "ok");
    } catch (err) {
      console.error(err);
      inscritos = [];
      if (contadorInscritos) contadorInscritos.textContent = "Error al consultar inscritos.";
      setMensaje(`No fue posible consultar inscritos. ${err?.message || ""}`.trim(), "error");
    }
  });

  btnPrepararDelete?.addEventListener("click", ejecutarDelete);

  // =========================
  // 11) INIT
  // =========================
  updateConfirmBox();
  loadCarreras();
});
