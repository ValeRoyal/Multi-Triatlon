document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");
  const mensaje = document.getElementById("mensaje-login");
  const inputIdentificacion = document.getElementById("identificacion");
  const inputCorreo = document.getElementById("correo");

  function setMensaje(texto, tipo = "info") {
    if (!mensaje) return;
    mensaje.textContent = texto;
    if (tipo === "error") mensaje.style.color = "#8b1d1d";
    else if (tipo === "ok") mensaje.style.color = "#0A3323";
    else mensaje.style.color = "";
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setMensaje("");

    const identificacion = (inputIdentificacion?.value ?? "").trim();
    const correo = (inputCorreo?.value ?? "").trim();

    if (!identificacion || !correo) {
      setMensaje("Por favor ingresa tu identificación y tu correo.", "error");
      return;
    }

    if (!isEmail(correo)) {
      setMensaje("El correo no parece válido. Verifica el formato.", "error");
      return;
    }

    try {
      const peticion = await fetch(" http://localhost:9091/api/triatletas/identificacion/" + encodeURIComponent(identificacion), {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (peticion.ok) {
        const usuario = await peticion.json();

        // Verificación del correo contra el dato real del backend
        if (usuario.correo !== correo) {
          setMensaje("Los datos no coinciden. Verifica tu identificación y correo.", "error");
          return;
        }

        localStorage.setItem("sessionUser", JSON.stringify({
        nombre: usuario.nombre,
        identificacion: usuario.identificacion,
        correo: usuario.correo
        }));
        setMensaje("¡Inicio de sesión exitoso!", "ok");
        window.location.href = "home.html";
      } else {
        setMensaje("No se encontró un triatleta con esa identificación.", "error");
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor.", "error");
    }
  });
});