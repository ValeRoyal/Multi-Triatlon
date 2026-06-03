/**
 * conInsCarrera.js
 * ----------------
 * Objetivo:
 * - Consultar TODOS los triatletas inscritos en una carrera específica.
 *
 * Flujo:
 * 1) Traemos carreras "frescas" desde microservicio Carrera:
 *      GET http://localhost:9092/api/carreras/todas
 * 2) El usuario selecciona una carrera (guardamos su id).
 * 3) Consultamos inscritos en esa carrera (microservicio Carrera):
 *      GET http://localhost:9092/api/carreras/{id}/triatletas
 * 4) Mostramos tabla con datos NO sensibles:
 *      - NO: id, identificacion
 *      - SÍ: nombre, correo, fechaNacimiento, genero, activo, urlFoto,
 *            categoriaEdad, modalidadCross, especialidad, carreraId
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) CONFIG
  // =========================
  const API_CARRERA = "http://localhost:9092";
  const ENDPOINT_CARRERAS_TODAS = `${API_CARRERA}/api/carreras/todas`;
  const ENDPOINT_INSCRITOS = (idCarrera) => `${API_CARRERA}/api/carreras/${idCarrera}/triatletas`;

  // =========================
  // 2) DOM
  // =========================
  const btnLogout = document.getElementById("btn-logout");
  const userNombreEl = document.getElementById("user-nombre");

  const btnCarrerasRecargar = document.getElementById("btn-carreras-recargar");
  const btnLimpiar = document.getElementById("btn-limpiar");
  const btnConsultar = document.getElementById("btn-consultar");

  const carrerasEstado = document.getElementById("carreras-estado");
  const carrerasScroll = document.getElementById("carreras-scroll");
  const inputCarreraId = document.getElementById("carrera-id");

  const mensaje = document.getElementById("mensaje");
  const contador = document.getElementById("contador");
  const resultadosWrap = document.getElementById("resultados-wrap");

  // =========================
  // 3) STATE
  // =========================
  let carrerasDisponibles = [];
  let carreraSeleccionada = null;

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
          <text x="50%" y="52%" text-anchor="middle" font-size="26" fill="#105666">🏁</text>
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
    return await resp.json(); // List<CarreraResponse>
  }

  async function fetchInscritos(idCarrera) {
    const resp = await fetch(ENDPOINT_INSCRITOS(idCarrera), { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.json(); // List<TriatletaResponse>
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
        <div><b>Dificultad:</b> ${c.nivelDificultad ?? "—"}</div>
      `;

      item.appendChild(nombre);
      item.appendChild(meta);

      function seleccionar() {
        carreraSeleccionada = c;
        if (inputCarreraId) inputCarreraId.value = String(c.id);
        if (btnConsultar) btnConsultar.disabled = false;

        // Re-render para marcar visualmente
        renderCarreras(carrerasDisponibles);

        // Limpio resultados anteriores (para evitar confusión)
        clearResultados();
        if (contador) contador.textContent = `Carrera seleccionada: ${safeText(c.nombreCarrera)} (ID: ${c.id}).`;
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
  // 7) RENDER: tabla triatletas (sin datos sensibles)
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
  // 8) LOAD: carreras
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
        if (btnConsultar) btnConsultar.disabled = true;
        return;
      }

      carrerasDisponibles = data;

      // Si había selección previa, intentamos mantenerla
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

  // =========================
  // 9) EVENTOS
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
    clearResultados();

    carreraSeleccionada = null;
    if (inputCarreraId) inputCarreraId.value = "";
    if (btnConsultar) btnConsultar.disabled = true;

    renderCarreras(carrerasDisponibles);
    if (contador) contador.textContent = "Aún no has consultado.";
  });

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

  // =========================
  // 10) INIT
  // =========================
  loadCarreras();
});