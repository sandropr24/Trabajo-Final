"use strict";

const DashboardModule = {
  charts: {},

  async init() {
    await this.load();
  },

  async load() {
    try {
      const { data: herramientas } = await http("/api/herramientas");
      const { data: prestamos } = await http("/api/prestamos");
      const { data: compras } = await http("/api/compras");
      const { data: proveedores } = await http("/api/proveedores");

      document.getElementById("totalHerramientas").textContent = herramientas.length;

      document.getElementById("totalDisponibles").textContent =
        herramientas.filter(h => h.nombre_status === "Disponible").length;

      document.getElementById("totalPrestadas").textContent =
        herramientas.filter(h => h.nombre_status === "Prestado").length;

      document.getElementById("totalUsuarios").textContent =
        AppState.usuarios?.length || 0;

      document.getElementById("totalProveedores").textContent = proveedores.length;
      document.getElementById("totalCompras").textContent = compras.length;

      const activos = prestamos.filter(p => !p.recibido_por);
      document.getElementById("prestamosActivos").textContent = activos.length;

      const hoy = new Date();
      const vencidos = activos.filter(
        p => p.fecha_devolucion && new Date(p.fecha_devolucion) < hoy
      );
      document.getElementById("prestamosVencidos").textContent = vencidos.length;


      this.renderCharts(compras);                

      this.renderGraficoPrestamosMes(prestamos); 


      this.renderRecientes(herramientas.slice(0, 5));

    } catch (error) {
      console.error("Error dashboard:", error);
    }
  },
  renderCharts(compras) {
    const comprasPorEmpresa = {};

    compras.forEach(c => {
      const empresa = c.nombre_proveedor || c.proveedor || "Sin Nombre";
      const monto = parseFloat(c.monto_total || c.total || 0);

      comprasPorEmpresa[empresa] =
        (comprasPorEmpresa[empresa] || 0) + monto;
    });

    const etiquetas = Object.keys(comprasPorEmpresa);
    const montos = Object.values(comprasPorEmpresa);

    const el = document.getElementById("chartPrincipal");
    if (!el) return;

    const ctx = el.getContext("2d");

    if (this.charts["principal"]) {
      this.charts["principal"].destroy();
    }

    this.charts["principal"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: etiquetas,
        datasets: [{
          label: "Total Invertido (S/)",
          data: montos,
          backgroundColor: "#6366f1",
          borderRadius: 8,
          barThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Total: S/ ${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Monto (S/)" }
          }
        }
      }
    });
  },

  renderGraficoPrestamosMes(prestamos) {
    const meses = {};

    const nombresMes = [
      "Enero", "Febrero", "Marzo", "Abril",
      "Mayo", "Junio", "Julio", "Agosto",
      "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    prestamos.forEach(p => {
      if (!p.fecha_prestamo) return;

      const fecha = new Date(p.fecha_prestamo);
      const mes = nombresMes[fecha.getMonth()];

      meses[mes] = (meses[mes] || 0) + 1;
    });

    const etiquetas = nombresMes;
    const valores = etiquetas.map(m => meses[m] || 0);

    const el = document.getElementById("chartPrestamosMes");
    if (!el) return;

    const ctx = el.getContext("2d");

    if (this.charts["prestamosMes"]) {
      this.charts["prestamosMes"].destroy();
    }

    this.charts["prestamosMes"] = new Chart(ctx, {
      type: "line",
      data: {
        labels: etiquetas,
        datasets: [{
          label: "Préstamos por mes",
          data: valores,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#6366f1",
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Cantidad de préstamos" }
          },
          x: {
            title: { display: true, text: "Mes" }
          }
        }
      }
    });
  },
renderRecientes(lista) {
    const tbody = document.getElementById("dashboardHerramientasRecientes");
    if (!tbody) return;

    tbody.innerHTML = lista.map(h => `
      <tr>
        <td class="fw-600">${escapeHtml(h.nombre || "")}</td>
        <td><span class="badge-marca-name">${escapeHtml(h.nombre_marca || "---")}</span></td>
        <td class="text-center">${escapeHtml(h.serie || "")}</td>
        <td>${escapeHtml(h.nombre_categoria || "")}</td>
        <td class="text-center">
          <span class="badge-estado ${h.nombre_estado?.toLowerCase().includes('bueno') ? 'badge-bueno' : 'badge-danado'}">
            ${escapeHtml(h.nombre_estado || "")}
          </span>
        </td>
        <td class="text-center">
          <span class="badge-status ${h.nombre_status?.toLowerCase().includes('disponible') ? 'badge-disponible' : 'badge-prestado'}">
            ${escapeHtml(h.nombre_status || "")}
          </span>
        </td>
      </tr>
    `).join("");
  }
};