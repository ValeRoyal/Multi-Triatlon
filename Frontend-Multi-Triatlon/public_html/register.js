/**
 * register.js
 * -----------
 * Maneja el registro de un nuevo triatleta. Construye un objeto TriatletaDTO
 * con los datos del formulario y lo envía al microservicio de triatletas vía POST.
 *
 * Funcionalidades incluidas:
 * - Carrete de imágenes para selección visual de especialidad
 * - Preview en tiempo real de la foto de perfil por URL
 * - Scroll de carreras disponibles cargadas desde el microservicio Carrera
 * - Validación de campos obligatorios antes del envío
 * - Conversión de tipos al formato exacto que espera el backend
 *
 * Microservicios involucrados:
 * - Triatleta: POST http://localhost:9091/api/triatletas/crear
 * - Carrera:   GET  http://localhost:9092/api/carreras/todas
 *
 * Campos TriatletaDTO:
 * - nombre, fechaNacimiento, identificacion, correo, genero  (@NotBlank/@NotNull)
 * - activo (Boolean)       siempre true en registro
 * - urlFoto (String)       URL pública válida
 * - categoriaEdad (String) @NotBlank
 * - modalidadCross (Boolean) @NotNull
 * - especialidad (String)  @NotBlank
 * - carreraId (Long)       opcional, se asigna al seleccionar una carrera del scroll
 */

document.addEventListener("DOMContentLoaded", () => {

  // ─── DATA: imágenes del carrete de especialidad ───────────────────────────────
  const especialidades = [
    { nombre: "Distancia SuperSprint", url: "https://cdn.shopify.com/s/files/1/2010/1493/files/image1_7f20f3e7-0046-4e87-b9d3-7b5c8010037b_480x480.png?v=1734345982" },
    { nombre: "Distancia Sprint",      url: "https://bettertriathlete.com/wp-content/uploads/2021/01/how-long-sprint-triathlon-distances-lengths-miles-kilometers-1024x641.jpg.webp" },
    { nombre: "Distancia Olímpica",    url: "https://bettertriathlete.com/wp-content/uploads/2021/01/how-long-olympic-triathlon-distances-lengths-miles-kilometers-1024x641.jpg.webp" },
    { nombre: "Media Distancia",       url: "https://triathlonbuzz.com/wp-content/uploads/2023/09/image-11.png.webp" },
    { nombre: "Larga Distancia",       url: "https://triathlonbuzz.com/wp-content/uploads/2023/09/image-10.png.webp" },
    { nombre: "Ultraman",              url: "https://triathlonbuzz.com/wp-content/uploads/2023/09/image-8.png.webp" },
  ];

  // ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
  // URLs base de los microservicios utilizados en esta pantalla
  const API_TRIATLETA = "http://localhost:9091";
  const API_CARRERA   = "http://localhost:9092";

  const ENDPOINT_REGISTRO  = `${API_TRIATLETA}/api/triatletas/crear`;
  const ENDPOINT_CARRERAS  = `${API_CARRERA}/api/carreras/todas`;

  // ─── DOM: formulario y campos TriatletaDTO ────────────────────────────────────
  const form    = document.getElementById("form-registro");
  const mensaje = document.getElementById("mensaje-registro");

  const inputNombre         = document.getElementById("nombre");
  const inputCorreo         = document.getElementById("correo");
  const inputIdentificacion = document.getElementById("identificacion");
  const inputFecha          = document.getElementById("fecha-nacimiento");
  const inputGenero         = document.getElementById("genero");
  const inputUrlFoto        = document.getElementById("url-foto");       // backend: urlFoto
  const inputCategoriaEdad  = document.getElementById("categoria-edad"); // backend: categoriaEdad
  const inputEspecialidad   = document.getElementById("especialidad");
  const inputCross          = document.getElementById("modalidad-cross"); // backend: Boolean
  const inputCarreraId      = document.getElementById("carrera-id");      // hidden, opcional

  // ─── DOM: preview foto ────────────────────────────────────────────────────────
  const previewWrap = document.getElementById("foto-preview-wrap");
  const previewImg  = document.getElementById("foto-preview");

  // ─── DOM: carrete especialidad ────────────────────────────────────────────────
  const carrete = document.getElementById("carrete-especialidad");
  const btnPrev = document.getElementById("carrete-prev");
  const btnNext = document.getElementById("carrete-next");

  // ─── DOM: scroll de carreras ──────────────────────────────────────────────────
  const carrerasEstado      = document.getElementById("carreras-estado");
  const carrerasScroll      = document.getElementById("carreras-scroll");
  const btnCarrerasRecargar = document.getElementById("btn-carreras-recargar");

  // ─── STATE ────────────────────────────────────────────────────────────────────
  // Carreras cargadas desde el microservicio y carrera actualmente seleccionada
  let carrerasDisponibles  = [];
  let carreraSeleccionada  = null;

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  /**
   * Muestra un mensaje de retroalimentación en el formulario de registro.
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
  function setCarrerasEstado(texto, tipo = "info") {
    if (!carrerasEstado) return;
    carrerasEstado.textContent = texto;
    if (tipo === "error") carrerasEstado.style.color = "#8b1d1d";
    else if (tipo === "ok") carrerasEstado.style.color = "#0A3323";
    else carrerasEstado.style.color = "";
  }

  /**
   * Valida que un string sea una URL HTTP o HTTPS válida.
   * @param {string} value
   * @returns {boolean}
   */
  function isHttpUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  // ─── PREVIEW FOTO ─────────────────────────────────────────────────────────────

  /**
   * Actualiza la imagen de preview según el valor actual del input de URL de foto.
   * Oculta el preview si la URL está vacía o no es válida.
   */
  function updateFotoPreview() {
    if (!inputUrlFoto || !previewWrap || !previewImg) return;
    const url = inputUrlFoto.value.trim();
    if (!url || !isHttpUrl(url)) {
      previewWrap.hidden = true;
      previewImg.removeAttribute("src");
      return;
    }
    previewWrap.hidden = false;
    previewImg.src = url;
  }

  inputUrlFoto?.addEventListener("input", updateFotoPreview);
  inputUrlFoto?.addEventListener("change", updateFotoPreview);

  // ─── CARRETE DE ESPECIALIDADES ────────────────────────────────────────────────

  /** Elimina la marca visual de selección de todos los ítems del carrete. */
  function limpiarSeleccionCarrete() {
    carrete?.querySelectorAll(".carrete-item.is-active").forEach((el) => {
      el.classList.remove("is-active");
      el.setAttribute("aria-selected", "false");
    });
  }

  /**
   * Selecciona una especialidad tanto en el select como visualmente en el carrete.
   * @param {string} nombre - Nombre exacto de la especialidad a seleccionar.
   */
  function seleccionarEspecialidad(nombre) {
    if (inputEspecialidad) inputEspecialidad.value = nombre;
    if (carrete) {
      limpiarSeleccionCarrete();
      const item = carrete.querySelector(`[data-nombre="${CSS.escape(nombre)}"]`);
      if (item) {
        item.classList.add("is-active");
        item.setAttribute("aria-selected", "true");
        item.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    }
  }

  /**
   * Construye dinámicamente los ítems del carrete de especialidades con
   * imagen, nombre y eventos de click y teclado para selección.
   */
  function renderCarreteEspecialidades() {
    if (!carrete) return;
    carrete.innerHTML = "";

    especialidades.forEach((esp) => {
      const item = document.createElement("div");
      item.className = "carrete-item";
      item.setAttribute("role", "listitem");
      item.setAttribute("tabindex", "0");
      item.dataset.nombre = esp.nombre;
      item.setAttribute("aria-selected", "false");

      const img = document.createElement("img");
      img.className = "carrete-img";
      img.src = esp.url;
      img.alt = `Imagen de ${esp.nombre}`;
      img.loading = "lazy";
      img.decoding = "async";

      const caption = document.createElement("div");
      caption.className = "carrete-caption";

      const name = document.createElement("span");
      name.className = "carrete-name";
      name.textContent = esp.nombre;

      caption.appendChild(name);
      item.appendChild(img);
      item.appendChild(caption);

      const activar = () => seleccionarEspecialidad(esp.nombre);
      item.addEventListener("click", activar);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activar(); }
      });

      carrete.appendChild(item);
    });
  }

  /**
   * Desplaza el carrete de especialidades horizontalmente.
   * @param {1|-1} dir - Dirección: 1 para adelante, -1 para atrás.
   */
  function scrollCarrete(dir) {
    if (!carrete) return;
    const amount = Math.max(220, Math.floor(carrete.clientWidth * 0.8));
    carrete.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  // Inicializar carrete y sincronización con el select
  renderCarreteEspecialidades();

  inputEspecialidad?.addEventListener("change", () => {
    const nombre = inputEspecialidad.value;
    if (!nombre) { limpiarSeleccionCarrete(); return; }
    seleccionarEspecialidad(nombre);
  });

  btnPrev?.addEventListener("click", () => scrollCarrete(-1));
  btnNext?.addEventListener("click", () => scrollCarrete(1));

  // ─── FETCH CARRERAS ───────────────────────────────────────────────────────────

  /**
   * Consulta al microservicio Carrera la lista completa de carreras disponibles.
   * Lanza un error si la respuesta HTTP no es exitosa.
   * @returns {Promise<Array>} Lista de objetos CarreraResponse.
   */
  async function fetchCarreras() {
    const resp = await fetch(ENDPOINT_CARRERAS, { method: "GET" });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  /**
   * Construye el scroll de carreras con los datos recibidos.
   * Marca visualmente la carrera actualmente seleccionada si existe.
   * Al seleccionar una carrera, actualiza el input hidden carrera-id.
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
        renderCarreras(carrerasDisponibles);
      }

      item.addEventListener("click", seleccionar);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(); }
      });

      carrerasScroll.appendChild(item);
    });
  }

  /**
   * Carga las carreras desde el microservicio y actualiza el scroll.
   * Si ya había una carrera seleccionada, intenta mantenerla si sigue disponible.
   */
  async function loadCarreras() {
    setCarrerasEstado("Cargando carreras...", "info");
    try {
      const data = await fetchCarreras();

      if (!Array.isArray(data) || data.length === 0) {
        carrerasDisponibles = [];
        renderCarreras([]);
        setCarrerasEstado("No hay carreras disponibles.", "info");
        return;
      }

      carrerasDisponibles = data;

      // Mantener selección previa si la carrera sigue existiendo tras recargar
      if (carreraSeleccionada) {
        const sigue = carrerasDisponibles.find((c) => c.id === carreraSeleccionada.id);
        if (!sigue) {
          carreraSeleccionada = null;
          if (inputCarreraId) inputCarreraId.value = "";
        } else {
          carreraSeleccionada = sigue;
          if (inputCarreraId) inputCarreraId.value = String(sigue.id);
        }
      }

      renderCarreras(carrerasDisponibles);
      setCarrerasEstado(`${data.length} carrera(s) disponibles. Selecciona una si deseas.`, "ok");
    } catch (err) {
      console.error(err);
      carrerasDisponibles = [];
      renderCarreras([]);
      setCarrerasEstado(`Error cargando carreras: ${err.message}`, "error");
    }
  }

  // Recargar carreras manualmente y cargar al entrar a la página
  btnCarrerasRecargar?.addEventListener("click", loadCarreras);
  loadCarreras();

  // ─── SUBMIT ───────────────────────────────────────────────────────────────────

  /**
   * Al enviar el formulario, valida todos los campos, construye el TriatletaDTO
   * con los tipos correctos y lo envía al microservicio de triatletas vía POST.
   * Muestra mensajes de éxito o error según la respuesta del backend.
   */
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMensaje("");

    const nombre         = (inputNombre?.value         ?? "").trim();
    const correo         = (inputCorreo?.value         ?? "").trim();
    const identificacion = (inputIdentificacion?.value ?? "").trim();
    const fechaNacimiento = (inputFecha?.value         ?? "").trim(); // YYYY-MM-DD
    const genero         = (inputGenero?.value         ?? "").trim();
    const urlFoto        = (inputUrlFoto?.value        ?? "").trim();
    const categoriaEdad  = (inputCategoriaEdad?.value  ?? "").trim();
    const especialidad   = (inputEspecialidad?.value   ?? "").trim();
    const modalidadCrossRaw = (inputCross?.value       ?? "").trim(); // "true"/"false"
    const carreraIdRaw   = (inputCarreraId?.value      ?? "").trim();

    if (!nombre || !correo || !identificacion || !fechaNacimiento || !genero ||
        !urlFoto || !categoriaEdad || !especialidad || !modalidadCrossRaw) {
      setMensaje("Por favor completa todos los campos obligatorios (*).", "error");
      return;
    }

    if (!isHttpUrl(urlFoto)) {
      setMensaje("La foto debe ser una URL válida que empiece por http:// o https://", "error");
      return;
    }

    // Conversión a tipos exactos que espera el backend
    const modalidadCross = modalidadCrossRaw === "true";
    const activo         = true;

    const carreraId = carreraIdRaw ? Number(carreraIdRaw) : null;
    if (carreraIdRaw && (!Number.isFinite(carreraId) || carreraId <= 0)) {
      setMensaje("Carrera seleccionada inválida. Recarga y selecciona de nuevo.", "error");
      return;
    }

    const datosRegistro = {
      nombre,
      fechaNacimiento,
      identificacion,
      correo,
      genero,
      activo,
      urlFoto,
      categoriaEdad,
      modalidadCross,
      especialidad,
      ...(carreraId !== null ? { carreraId } : {}),
    };

    try {
      const peticion = await fetch(ENDPOINT_REGISTRO, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datosRegistro)
      });

      if (peticion.ok) {
        setMensaje("¡Registro exitoso!", "ok");
      } else {
        const err = await peticion.json().catch(() => null);
        setMensaje("Error al registrar: " + (err?.message || "verifica los datos."), "error");
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor.", "error");
    }
  });
});