'use strict';

function formatDate(fecha) {
  if (!fecha) return "";

  return new Date(fecha).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

const PrestamosModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById("bodyPrestamos");

    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <div class="spinner-custom"></div>
        </td>
      </tr>
    `;

    try {
      const { data } = await http("/api/prestamos");

      AppState.prestamos = data;
      this._render(data);
      updateBadges?.();

    } catch (error) {
      showToast("Error al cargar préstamos: " + error.message, "error");
    }
  },

  _render(lista) {
    setText("totalPrestamosLabel", `${lista.length} préstamo(s) encontrado(s)`);

    const tbody = document.getElementById("bodyPrestamos");

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="bi bi-clipboard-data"></i>
              <p>No hay préstamos registrados</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map((p, i) => `
      <tr>
        <td>${String(i + 1).padStart(2, "0")}</td>
        <td>${escapeHtml(p.usuario || "")}</td>
        <td>${formatDate(p.fecha_prestamo)}</td>
        <td>${formatDate(p.fecha_devolucion)}</td>
        <td>${escapeHtml(p.entregado_por || "No registrado")}</td>
        <td>${escapeHtml(p.recibido_por || "No registrado")}</td>
        <td>
          <button class="btn-action btn-action-view"
            onclick="PrestamosModule.verDetalle(${p.id_prestamo})"
            title="Ver detalle">
            <i class="bi bi-eye-fill"></i>
          </button>
        </td>
      </tr>
    `).join("");
  },

  async openModal() {
    document.getElementById("pUsuario").innerHTML = `<option value="">Cargando...</option>`;
    document.getElementById("pHerramienta").innerHTML = `<option value="">Cargando...</option>`;
    document.getElementById("pCantidad").value = 1;
    document.getElementById("pEstadoFisico").value = "Buen estado";

    openOverlay("modalPrestamoOverlay");

    await this._loadCombos();
  },

  async _loadCombos() {
    try {
      const { data: usuarios } = await http("/api/usuarios");
      const { data: herramientas } = await http("/api/herramientas");

      const usuariosOptions = `
        <option value="">Seleccione usuario</option>
        ${usuarios.map(u => `
          <option value="${u.id_usuario}">
            ${escapeHtml(u.nombres_completos)}
          </option>
        `).join("")}
      `;

      document.getElementById("pUsuario").innerHTML = usuariosOptions;
      document.getElementById("pEntregadoPor").innerHTML = usuariosOptions;
      document.getElementById("pRecibidoPor").innerHTML = usuariosOptions;

      document.getElementById("pHerramienta").innerHTML = `
        <option value="">Seleccione herramienta</option>
        ${herramientas.map(h => `
          <option value="${h.id_herramienta}">
            ${escapeHtml(h.nombre)} - Stock: ${h.stock}
          </option>
        `).join("")}
      `;

    } catch (e) {
      showToast("Error cargando datos del préstamo: " + e.message, "error");
    }
  },

  async save() {
    const id_usuario = document.getElementById("pUsuario").value;
    const entregado_por = document.getElementById("pEntregadoPor").value;
    const recibido_por = document.getElementById("pRecibidoPor").value;
    const id_herramienta = document.getElementById("pHerramienta").value;
    const cantidad = Number(document.getElementById("pCantidad").value);
    const estado_fisico = document.getElementById("pEstadoFisico").value.trim();

    if (!id_usuario) {
      showToast("Selecciona un usuario", "error");
      return;
    }

    if (!id_herramienta) {
      showToast("Selecciona una herramienta", "error");
      return;
    }

    if (!cantidad || cantidad <= 0) {
      showToast("La cantidad debe ser mayor a 0", "error");
      return;
    }

    try {
      await http("/api/prestamos", "POST", {
        id_usuario,
        entregado_por: entregado_por || null,
        recibido_por: recibido_por || null,
        herramientas: [
          {
            id_herramienta,
            cantidad,
            estado_fisico: estado_fisico || "Buen estado"
          }
        ]
      });

      await Swal.fire({
        title: "Préstamo registrado",
        text: "El préstamo fue guardado correctamente",
        icon: "success",
        confirmButtonColor: "#6366f1",
        background: "#1e293b",
        color: "#fff"
      });

      closeOverlay("modalPrestamoOverlay");
      await this.load();

    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#1e293b",
        color: "#fff"
      });
    }
  },

  async verDetalle(id) {
    try {
      const { data } = await http(`/api/prestamos/${id}`);

      const detalleHtml = data.detalle.map(d => `
        <p>
          <strong>${escapeHtml(d.nombre)}</strong><br>
          Prestado: ${d.cantidad_prestada} |
          Devuelto: ${d.cantidad_devuelta}<br>
          Estado: ${escapeHtml(d.estado_fisico || "")}
        </p>
      `).join("");

      Swal.fire({
        title: `Préstamo #${data.id_prestamo}`,
        html: `
          <p><strong>Usuario:</strong> ${escapeHtml(data.usuario)}</p>
          <p><strong>Fecha préstamo:</strong> ${formatDate(data.fecha_prestamo)}</p>
          <p><strong>Fecha devolución:</strong> ${formatDate(data.fecha_devolucion)}</p>
          <hr>
          ${detalleHtml}
        `,
        icon: "info",
        confirmButtonColor: "#6366f1",
        background: "#1e293b",
        color: "#fff"
      });

    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#1e293b",
        color: "#fff"
      });
    }
  },

  _filter() {
    const search = document.getElementById("searchPrestamo")?.value.toLowerCase() || "";

    const filtrados = AppState.prestamos.filter(p =>
      String(p.usuario || "").toLowerCase().includes(search) ||
      String(p.entregado_por || "").toLowerCase().includes(search) ||
      String(p.recibido_por || "").toLowerCase().includes(search)
    );

    this._render(filtrados);
  },

  _bindEvents() {
    document.getElementById("btnNuevoPrestamo")
      ?.addEventListener("click", () => this.openModal());

    document.getElementById("btnSavePrestamo")
      ?.addEventListener("click", () => this.save());

    document.getElementById("btnCancelPrestamo")
      ?.addEventListener("click", () => closeOverlay("modalPrestamoOverlay"));

    document.getElementById("btnCloseModalPrestamo")
      ?.addEventListener("click", () => closeOverlay("modalPrestamoOverlay"));

    document.getElementById("btnRefreshPrestamos")
      ?.addEventListener("click", () => this.load());

    document.getElementById("searchPrestamo")
      ?.addEventListener("input", () => this._filter());

    document.getElementById("modalPrestamoOverlay")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalPrestamoOverlay") {
          closeOverlay("modalPrestamoOverlay");
        }
      });
  }
};