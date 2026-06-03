document.addEventListener("DOMContentLoaded", () => {
  const elNombre = document.getElementById("home-nombre");
  const btnLogout = document.getElementById("btn-logout");

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
    localStorage.removeItem("sessionUser");
    window.location.href = "index.html";
  });
});