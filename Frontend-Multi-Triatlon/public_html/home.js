document.addEventListener("DOMContentLoaded", () => {
  const elNombre = document.getElementById("home-nombre");
  const btnLogout = document.getElementById("btn-logout");

  // Función para obtener el usuario de la sesión desde el almacenamiento local
  //Porque esto nos sirve para mostrar el nombre del usuario en la página
  //después de que haya iniciado sesión, y también para manejar
  //el cierre de sesión eliminando la información del usuario almacenada.
  function getSessionUser() {
    try {
      //Obtenemos el usuario de la sesión desde el almacenamiento local,
      //si no hay ningún usuario almacenado, se devuelve null.
      const raw = localStorage.getItem("sessionUser");
      if (!raw) return null;
      //pasera a json el string que se obtuvo del almacenamiento local 
      // para poder acceder a sus propiedades.
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const sessionUser = getSessionUser();
  const nombre = sessionUser?.nombre?.trim() || "Atleta";
  if (elNombre) elNombre.textContent = nombre;
  
  // Agrega un evento de click al botón de logout, 
  // que elimina la información del usuario que guardamos 
  // en el localstorage
  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });
});