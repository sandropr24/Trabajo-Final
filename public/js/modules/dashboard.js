'use strict';

const DashboardModule = {
  async init() {
    await this.load();
  },

  async load() {
    try {
      const { data } = await http("/api/herramientas");

      document.getElementById("totalHerramientas").textContent = data.length;

      document.getElementById("totalDisponibles").textContent =
        data.filter(h => h.nombre_status === "Disponible").length;

      document.getElementById("totalPrestadas").textContent =
        data.filter(h => h.nombre_status === "Prestado").length;

      document.getElementById("totalUsuarios").textContent = AppState.usuarios?.length || 0;

      this.renderRecientes(data.slice(0, 5));

    } catch (error) {
      console.error("Error dashboard:", error);
    }
  },

  renderRecientes(lista) {
    const tbody = document.getElementById("dashboardHerramientasRecientes");

    tbody.innerHTML = lista.map(h => `
      <tr>
        <td class="fw-600">${escapeHtml(h.nombre)}</td>
        <td>${escapeHtml(h.serie)}</td>
        <td>${escapeHtml(h.nombre_categoria)}</td>
        <td>${escapeHtml(h.nombre_estado)}</td>
        <td>${escapeHtml(h.nombre_status)}</td>
      </tr>
    `).join("");
  }
};