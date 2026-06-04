document.addEventListener("DOMContentLoaded", function () { //Se asegura que todo el contenido del html se carge para que no hayan posibles errores
  //Seleccionamos los botones de inicio y de registro por su id 
  //para luego agregarles un evento de click que ejecute la función
  //animarYRedirigir, la cual se encarga de animar el botón y redirigir 
  //al usuario a la página correspondiente después de un breve retraso.
  const btnInicio = document.getElementById("btn-inicio");
  const btnRegistro = document.getElementById("btn-registrarse");

  // Función para animar el botón y redirigir al usuario
  function animarYRedirigir(enlace, destino) {
    enlace.classList.remove("boton-animado");
    void enlace.offsetWidth; // reinicia animación
    enlace.classList.add("boton-animado");
    setTimeout(function () {
      window.location.href = destino;
    }, 280);
  }

  if (btnInicio) {
    // Agrega un evento de click al botón de inicio
    //la función e es el evento que se dispara al hacer click, 
    // se previene el comportamiento por defecto del enlace para evitar 
    // que la página se recargue inmediatamente, y luego se llama a la función
    //  animarYRedirigir con el botón y la URL de destino.
    btnInicio.addEventListener("click", function (e) {
      e.preventDefault();
      animarYRedirigir(btnInicio, "login.html");
    });
  }

  //y pues este hace lo mismo que el otro pero con el de registro :)
  if (btnRegistro) {
    btnRegistro.addEventListener("click", function (e) {
      e.preventDefault();
      animarYRedirigir(btnRegistro, "register.html");
    });
  }
});