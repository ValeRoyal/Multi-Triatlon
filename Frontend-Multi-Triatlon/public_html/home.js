document.addEventListener("DOMContentLoaded", () => {
  const elNombre = document.getElementById("home-nombre");
  const btnLogout = document.getElementById("btn-logout");

  // Convención recomendada: guardar sesión en localStorage
  // localStorage.setItem("sessionUser", JSON.stringify({ nombre, identificacion, correo }))
  function getSessionUser() {
    try {
      const raw = localStorage.getItem("sessionUser");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const sessionUser = getSessionUser();
  const nombre = sessionUser?.nombre?.trim() || "Atleta";
  if (elNombre) elNombre.textContent = nombre;

  btnLogout?.addEventListener("click", () => {
    // Limpia sesión y redirige
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });
});