'use strict';

const ROUTES = {
  dashboard: {
    title: "Dashboard",
    view: "view/dashboard.html",
    module: () => DashboardModule,
  },

  herramientas: {
    title: "Herramientas",
    view: "view/herramientas.html",
    module: () => HerramientasModule,
  },

  usuarios: {
    title: "Usuarios",
    view: "view/usuarios.html",
    module: () => UsuariosModule,
  },

  prestamos: {
    title: "Prestamos",
    view: "view/prestamos.html",
    module: () => PrestamosModule,
  },

  marcas: {
    title: "Marcas",
    view: "view/marcas.html",
    module: () => MarcasModule,
  },

  proveedores: {
    title: "Proveedores",
    view: "view/proveedores.html",
    module: () => ProveedoresModule,
  },

  compras: {
    title: "Compras",
    view: "view/compras.html",
    module: () => ComprasModule,
  },
};

async function precargarDatos() {
  try {
    const [herramientas, usuarios, prestamos, marcas, proveedores, compras] = await Promise.all([
      http("/api/herramientas"),
      http("/api/usuarios"),
      http("/api/prestamos"),
      http("/api/marcas"),
      http("/api/proveedores"),
      http("/api/compras"),
    ]);

    AppState.herramientas = herramientas.data;
    AppState.usuarios = usuarios.data;
    AppState.prestamos = prestamos.data;
    AppState.marcas = marcas.data;
    AppState.proveedores = proveedores.data;
    AppState.compras = compras.data;

    updateBadges();
  } catch (error) {
    console.error("Error precargando datos:", error.message);
  }
}

async function navigate(page) {
  const items = document.querySelectorAll(".nav-item");
  const title = document.getElementById("topbarTitle");
  const container = document.getElementById("pageContainer");

  const route = ROUTES[page];

  if (!route) {
    console.error("Ruta no encontrada:", page);
    return;
  }

  items.forEach(item => {
    item.classList.remove("active");

    if (item.dataset.page === page) {
      item.classList.add("active");
    }
  });

  title.textContent = route.title;

  try {
    const response = await fetch(route.view);

    if (!response.ok) {
      throw new Error("No se pudo cargar la vista: " + route.view);
    }

    container.innerHTML = await response.text();

    const module = route.module();

    if (module && typeof module.init === "function") {
      await module.init();
    }

  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <p>${error.message}</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      navigate(item.dataset.page);
    });
  });

  navigate("dashboard");
  precargarDatos();
});