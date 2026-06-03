document.addEventListener("DOMContentLoaded", function () {
  const btnInicio = document.getElementById("btn-inicio");
  const btnRegistro = document.getElementById("btn-registrarse");

  function animarYRedirigir(enlace, destino) {
    enlace.classList.remove("boton-animado");
    void enlace.offsetWidth; // reinicia animación
    enlace.classList.add("boton-animado");
    setTimeout(function () {
      window.location.href = destino;
    }, 280);
  }

  if (btnInicio) {
    btnInicio.addEventListener("click", function (e) {
      e.preventDefault();
      animarYRedirigir(btnInicio, "login.html");
    });
  }

  if (btnRegistro) {
    btnRegistro.addEventListener("click", function (e) {
      e.preventDefault();
      animarYRedirigir(btnRegistro, "register.html");
    });
  }
});