"use strict";

const DashboardModule = {
  async init() {
    await this.load();
  },

  async load() {
    try {
      const { data } = await http("/api/herramientas");

      document.getElementById("totalHerramientas").textContent = data.length;

      document.getElementById("totalDisponibles").textContent = data.filter(
        (h) => h.nombre_status === "Disponible",
      ).length;

      document.getElementById("totalPrestadas").textContent = data.filter(
        (h) => h.nombre_status === "Prestado",
      ).length;

      document.getElementById("totalUsuarios").textContent =
        AppState.usuarios?.length || 0;

      this.renderRecientes(data.slice(0, 5));
    } catch (error) {
      console.error("Error dashboard:", error);
    }
  },

  renderRecientes(lista) {
    const tbody = document.getElementById("dashboardHerramientasRecientes");

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="bi bi-tools"></i>
              <p>No hay herramientas recientes</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista
      .map((h) => {
        const estado = (h.nombre_estado || "").toLowerCase();
        const status = (h.nombre_status || "").toLowerCase();

        return `
        <tr>
          <td class="fw-600">${escapeHtml(h.nombre || "")}</td>

          <td>
            <span class="badge-marca-name">
              ${escapeHtml(h.nombre_marca || "Sin marca")}
            </span>
          </td>

          <td>${escapeHtml(h.serie || "")}</td>

          <td>${escapeHtml(h.nombre_categoria || "")}</td>

          <td>
            <span class="badge-estado ${
              estado.includes("bueno") || estado.includes("nueva")
                ? "badge-bueno"
                : "badge-danado"
            }">
              ${escapeHtml(h.nombre_estado || "")}
            </span>
          </td>

          <td>
            <span class="badge-status ${
              status.includes("disponible")
                ? "badge-disponible"
                : "badge-prestado"
            }">
              ${escapeHtml(h.nombre_status || "")}
            </span>
          </td>
        </tr>
      `;
      })
      .join("");
  },
};
