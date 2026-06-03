document.addEventListener("DOMContentLoaded", () => {
  const especialidades = [
    { nombre: "Distancia SuperSprint", url: "https://cdn.shopify.com/s/files/1/2010/1493/files/image1_7f20f3e7-0046-4e87-b9d3-7b5c8010037b_480x480.png?v=1734345982" },
    { nombre: "Distancia Sprint", url: "https://bettertriathlete.com/wp-content/uploads/2021/01/how-long-sprint-triathlon-distances-lengths-miles-kilometers-1024x641.jpg.webp" },
    { nombre: "Distancia Olímpica", url: "https://bettertriathlete.com/wp-content/uploads/2021/01/how-long-olympic-triathlon-distances-lengths-miles-kilometers-1024x641.jpg.webp" },
    { nombre: "Media Distancia", url: "https://triathlonbuzz.com/wp-content/uploads/2023/09/image-11.png.webp" },
    { nombre: "Larga Distancia", url: "https://triathlonbuzz.com/wp-content/uploads/2023/09/image-10.png.webp" },
    { nombre: "Ultraman", url: "https://triathlonbuzz.com/wp-content/uploads/2023/09/image-8.png.webp" },
  ];

  const form = document.getElementById("form-registro");
  const mensaje = document.getElementById("mensaje-registro");

  const inputNombre = document.getElementById("nombre");
  const inputCorreo = document.getElementById("correo");
  const inputIdentificacion = document.getElementById("identificacion");
  const inputFecha = document.getElementById("fecha-nacimiento");
  const inputGenero = document.getElementById("genero");
  const inputFotoUrl = document.getElementById("foto-url");
  const inputCategoria = document.getElementById("categoria");
  const inputEspecialidad = document.getElementById("especialidad");
  const inputCross = document.getElementById("modalidad-cross");

  const previewWrap = document.getElementById("foto-preview-wrap");
  const previewImg = document.getElementById("foto-preview");

  const carrete = document.getElementById("carrete-especialidad");
  const btnPrev = document.getElementById("carrete-prev");
  const btnNext = document.getElementById("carrete-next");

  function setMensaje(texto, tipo = "info") {
    if (!mensaje) return;
    mensaje.textContent = texto;
    if (tipo === "error") mensaje.style.color = "#8b1d1d";
    else if (tipo === "ok") mensaje.style.color = "#0A3323";
    else mensaje.style.color = "";
  }

  function isHttpUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  // Preview para fotoUrl
  function updateFotoPreview() {
    if (!inputFotoUrl || !previewWrap || !previewImg) return;

    const url = inputFotoUrl.value.trim();
    if (!url) {
      previewWrap.hidden = true;
      previewImg.removeAttribute("src");
      return;
    }

    if (!isHttpUrl(url)) {
      previewWrap.hidden = true;
      previewImg.removeAttribute("src");
      return;
    }

    previewWrap.hidden = false;
    previewImg.src = url;
  }

  inputFotoUrl?.addEventListener("input", updateFotoPreview);
  inputFotoUrl?.addEventListener("change", updateFotoPreview);

  function limpiarSeleccionCarrete() {
    carrete?.querySelectorAll(".carrete-item.is-active").forEach((el) => {
      el.classList.remove("is-active");
      el.setAttribute("aria-selected", "false");
    });
  }

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

  function renderCarrete() {
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activar();
        }
      });

      carrete.appendChild(item);
    });
  }

  function scrollCarrete(dir) {
    if (!carrete) return;
    const amount = Math.max(220, Math.floor(carrete.clientWidth * 0.8));
    carrete.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  renderCarrete();

  inputEspecialidad?.addEventListener("change", () => {
    const nombre = inputEspecialidad.value;
    if (!nombre) {
      limpiarSeleccionCarrete();
      return;
    }
    seleccionarEspecialidad(nombre);
  });

  btnPrev?.addEventListener("click", () => scrollCarrete(-1));
  btnNext?.addEventListener("click", () => scrollCarrete(1));

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    setMensaje("");

    const required = [
      inputNombre,
      inputCorreo,
      inputIdentificacion,
      inputFecha,
      inputGenero,
      inputFotoUrl,
      inputCategoria,
      inputEspecialidad,
      inputCross,
    ];

    const falta = required.find((el) => !el || !el.value.trim());
    if (falta) {
      setMensaje("Por favor completa todos los campos obligatorios (*).", "error");
      return;
    }

    const fotoUrl = inputFotoUrl.value.trim();
    if (!isHttpUrl(fotoUrl)) {
      setMensaje("La foto debe ser una URL válida que empiece por http:// o https://", "error");
      return;
    }

    // Objeto de la persona ya listo para guardar en el back
    const datosRegistro = {
      nombre: inputNombre.value.trim(),
      correo: inputCorreo.value.trim(),
      identificacion: inputIdentificacion.value.trim(),
      fechaNacimiento: inputFecha.value, // YYYY-MM-DD
      genero: inputGenero.value,
      categoria: inputCategoria.value,
      especialidad: inputEspecialidad.value,
      modalidadCross: inputCross.value,
      fotoUrl, // <- STRING
      createdAt: new Date().toISOString(),
    };

    window.__datosRegistro = datosRegistro;
    console.log("datosRegistro =>", datosRegistro);

    setMensaje("Datos capturados. Revisa la consola (datosRegistro).", "ok");
  });
});