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

  form?.addEventListener("submit", (e) => {
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

    const datosLogin = { identificacion, correo };

    window.__datosLogin = datosLogin;
    console.log("datosLogin =>", datosLogin);

    setMensaje("Datos capturados. Revisa la consola: __datosLogin.", "ok");
  });
});