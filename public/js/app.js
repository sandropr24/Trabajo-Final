'use strict';

const AppState = {
  marcas: [],
  herramientas: [],
  prestamos: [],
  usuarios: [],
  proveedores: [],
  compras:[],
  deleteTarget: { type: null, id: null, name: null, onConfirm: null },
};

function obtenerUsuario() {
  return JSON.parse(localStorage.getItem("usuario"));
}

function protegerSesion() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  const nombreSidebar = document.getElementById("sidebarUserName");
  const rolSidebar = document.getElementById("sidebarUserRole");

  if (nombreSidebar) nombreSidebar.textContent = usuario.nombres_completos;
  if (rolSidebar) rolSidebar.textContent = usuario.rol;
}

function aplicarPermisos() {
  const usuario = obtenerUsuario();

  if (!usuario) return;

  document.querySelectorAll(".nav-item").forEach(item => {
    const rolesPermitidos = item.dataset.role;

    if (!rolesPermitidos) return;

    const listaRoles = rolesPermitidos.split(",");

    if (!listaRoles.includes(usuario.rol)) {
      item.style.display = "none";
    }
  });
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

function updateBadges() {
  setText("badge-herramientas", AppState.herramientas.length);
  setText("badge-usuarios", AppState.usuarios.length);
  setText("badge-prestamos", AppState.prestamos.length);
  setText("badge-dashboard", AppState.herramientas.length);
  setText("badge-marcas", AppState.marcas.length);
}

document.addEventListener("DOMContentLoaded", () => {
  protegerSesion();
  aplicarPermisos();

  const btnLogout = document.getElementById("btnLogout");

  btnLogout?.addEventListener("click", () => {
    cerrarSesion();
  });
});

async function http(url, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Error en la petición");
  }

  return result;
}