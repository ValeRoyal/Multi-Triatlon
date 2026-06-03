/**
 * modfCarrera.js
 * --------------
 * Objetivo:
 * - Modificar la ubicación o la fecha de ejecución de una carrera existente.
 *
 * Flujo:
 * 1) Traemos todas las carreras:
 *      GET http://localhost:9092/api/carreras/todas
 * 2) El usuario selecciona una carrera (se habilitan ambos formularios).
 * 3a) Actualizar ubicación:
 *      PATCH http://localhost:9092/api/carreras/{id}/ubicacion
 *      Body: { "ubicacion": "..." }
 * 3b) Actualizar fecha de ejecución:
 *      PATCH http://localhost:9092/api/carreras/{id}/fecha-ejecucion
 *      Body: { "fechaEjecucion": "YYYY-MM-DDTHH:mm:ss" }
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) CONFIG
  // =========================
  const API_CARRERA = "http://localhost:9092";
  const ENDPOINT_CARRERAS_TODAS = `${API_CARRERA}/api/carreras/todas`;
  const ENDPOINT_UBICACION = (id) => `${API_CARRERA}/api/carreras/${id}/ubicacion`;
  const ENDPOINT_FECHA = (id) => `${API_CARRERA}/api/carreras/${id}/fecha-ejecucion`;

  // =========================
  // 2) DOM
  // =========================
  const btnLogout = document.getElementById("btn-logout");
  const userNombreEl = document.getElementById("user-nombre");

  const btnCarrerasRecargar = document.getElementById("btn-carreras-recargar");
  const carrerasEstado = document.getElementById("carreras-estado");
  const carrerasScroll = document.getElementById("carreras-scroll");
  const inputCarreraId = document.getElementById("carrera-id");
  const mensajeCarreras = document.getElementById("mensaje-carreras");
  const carreraSeleccionadaInfo = document.getElementById("carrera-seleccionada-info");

  const formUbicacion = document.getElementById("form-ubicacion");
  const inputNuevaUbicacion = document.getElementById("nueva-ubicacion");
  const btnUbicacion = document.getElementById("btn-ubicacion");
  const mensajeUbicacion = document.getElementById("mensaje-ubicacion");

  const formFecha = document.getElementById("form-fecha");
  const inputNuevaFecha = document.getElementById("nueva-fecha");
  const btnFecha = document.getElementById("btn-fecha");
  const mensajeFecha = document.getElementById("mensaje-fecha");

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

  function setMensaje(el, texto, tipo = "info") {
    if (!el) return;
    el.textContent = texto;
    if (tipo === "error") el.style.color = "#8b1d1d";
    else if (tipo === "ok") el.style.color = "#0A3323";
    else el.style.color = "";
  }

  function setEstadoCarreras(texto, tipo = "info") {
    if (!carrerasEstado) return;
    carrerasEstado.textContent = texto;
    if (tipo === "error") carrerasEstado.style.color = "#8b1d1d";
    else if (tipo === "ok") carrerasEstado.style.color = "#0A3323";
    else carrerasEstado.style.color = "";
  }

  function habilitarFormularios(carrera) {
    const activo = carrera !== null;

    if (inputNuevaUbicacion) inputNuevaUbicacion.disabled = !activo;
    if (btnUbicacion) btnUbicacion.disabled = !activo;
    if (inputNuevaFecha) inputNuevaFecha.disabled = !activo;
    if (btnFecha) btnFecha.disabled = !activo;

    if (carreraSeleccionadaInfo) {
      carreraSeleccionadaInfo.textContent = activo
        ? `Carrera seleccionada: ${carrera.nombreCarrera} (ID: ${carrera.id}).`
        : "Selecciona una carrera para habilitar los formularios.";
    }

    // Pre-rellenar con valores actuales para comodidad del usuario
    if (activo) {
      if (inputNuevaUbicacion) inputNuevaUbicacion.value = carrera.ubicacion ?? "";
      if (inputNuevaFecha && carrera.fechaEjecucion) {
        // LocalDateTime viene como "YYYY-MM-DDTHH:mm:ss" — datetime-local necesita "YYYY-MM-DDTHH:mm"
        inputNuevaFecha.value = carrera.fechaEjecucion.slice(0, 16);
      }
    } else {
      if (inputNuevaUbicacion) inputNuevaUbicacion.value = "";
      if (inputNuevaFecha) inputNuevaFecha.value = "";
    }

    // Limpiar mensajes al cambiar selección
    setMensaje(mensajeUbicacion, "");
    setMensaje(mensajeFecha, "");
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

  async function fetchPatchUbicacion(id, ubicacion) {
    const resp = await fetch(ENDPOINT_UBICACION(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ubicacion }),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.text(); // El backend retorna String "Ubicacion actualizada"
  }

  async function fetchPatchFecha(id, fechaEjecucion) {
    const resp = await fetch(ENDPOINT_FECHA(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fechaEjecucion }),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.text(); // El backend retorna String "Fecha de Ejecucion actualizada"
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
        habilitarFormularios(c);
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
  // 7) LOAD: carreras
  // =========================
  async function loadCarreras() {
    setMensaje(mensajeCarreras, "");
    setEstadoCarreras("Cargando carreras...", "info");

    try {
      const data = await fetchCarrerasTodas();

      if (!Array.isArray(data) || data.length === 0) {
        carrerasDisponibles = [];
        renderCarreras([]);
        setEstadoCarreras("No hay carreras disponibles.", "info");
        habilitarFormularios(null);
        return;
      }

      carrerasDisponibles = data;

      // Mantener selección previa si sigue existiendo
      if (carreraSeleccionada) {
        const sigue = carrerasDisponibles.find((c) => c.id === carreraSeleccionada.id);
        if (!sigue) {
          carreraSeleccionada = null;
          if (inputCarreraId) inputCarreraId.value = "";
          habilitarFormularios(null);
        } else {
          carreraSeleccionada = sigue;
          habilitarFormularios(sigue);
        }
      }

      renderCarreras(carrerasDisponibles);
      setEstadoCarreras(`${data.length} carrera(s) disponibles. Selecciona una.`, "ok");
    } catch (err) {
      console.error(err);
      carrerasDisponibles = [];
      renderCarreras([]);
      setEstadoCarreras(`Error cargando carreras: ${err.message}`, "error");
      habilitarFormularios(null);
    }
  }

  // =========================
  // 8) SUBMIT: ubicación
  // =========================
  formUbicacion?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMensaje(mensajeUbicacion, "");

    const id = (inputCarreraId?.value ?? "").trim();
    const ubicacion = (inputNuevaUbicacion?.value ?? "").trim();

    if (!id) {
      setMensaje(mensajeUbicacion, "Selecciona una carrera primero.", "error");
      return;
    }
    if (!ubicacion) {
      setMensaje(mensajeUbicacion, "La ubicación no puede estar vacía.", "error");
      return;
    }

    if (btnUbicacion) btnUbicacion.disabled = true;

    try {
      await fetchPatchUbicacion(id, ubicacion);
      setMensaje(mensajeUbicacion, "Ubicación actualizada correctamente.", "ok");

      // Actualizar dato local para que el scroll refleje el cambio
      if (carreraSeleccionada) {
        carreraSeleccionada.ubicacion = ubicacion;
        const idx = carrerasDisponibles.findIndex((c) => c.id === carreraSeleccionada.id);
        if (idx !== -1) carrerasDisponibles[idx].ubicacion = ubicacion;
        renderCarreras(carrerasDisponibles);
      }
    } catch (err) {
      console.error(err);
      setMensaje(mensajeUbicacion, `No fue posible actualizar. ${err.message || ""}`.trim(), "error");
    } finally {
      if (btnUbicacion) btnUbicacion.disabled = false;
    }
  });

  // =========================
  // 9) SUBMIT: fecha
  // =========================
  formFecha?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMensaje(mensajeFecha, "");

    const id = (inputCarreraId?.value ?? "").trim();
    const fechaRaw = (inputNuevaFecha?.value ?? "").trim(); // "YYYY-MM-DDTHH:mm"

    if (!id) {
      setMensaje(mensajeFecha, "Selecciona una carrera primero.", "error");
      return;
    }
    if (!fechaRaw) {
      setMensaje(mensajeFecha, "La fecha no puede estar vacía.", "error");
      return;
    }

    // El backend espera LocalDateTime: agregar :00 si falta
    const fechaEjecucion = fechaRaw.length === 16 ? fechaRaw + ":00" : fechaRaw;

    if (btnFecha) btnFecha.disabled = true;

    try {
      await fetchPatchFecha(id, fechaEjecucion);
      setMensaje(mensajeFecha, "Fecha de ejecución actualizada correctamente.", "ok");

      // Actualizar dato local
      if (carreraSeleccionada) {
        carreraSeleccionada.fechaEjecucion = fechaEjecucion;
        const idx = carrerasDisponibles.findIndex((c) => c.id === carreraSeleccionada.id);
        if (idx !== -1) carrerasDisponibles[idx].fechaEjecucion = fechaEjecucion;
        renderCarreras(carrerasDisponibles);
      }
    } catch (err) {
      console.error(err);
      setMensaje(mensajeFecha, `No fue posible actualizar. ${err.message || ""}`.trim(), "error");
    } finally {
      if (btnFecha) btnFecha.disabled = false;
    }
  });

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

  // =========================
  // 11) INIT
  // =========================
  loadCarreras();
});