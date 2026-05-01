'use strict';

function formatDate(fecha) {
  if (!fecha) return "";

  return new Date(fecha).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function isVencido(fecha) {
  if (!fecha) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaDev = new Date(fecha);
  fechaDev.setHours(0, 0, 0, 0);

  return fechaDev < hoy;
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
              <i class="bi bi-arrow-left-right"></i>
              <p>No hay préstamos registrados</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map((p, i) => {
      const vencido = isVencido(p.fecha_devolucion);

      return `
        <tr>
          <td>${String(i + 1).padStart(2, "0")}</td>

          <td>
            <span class="badge-user">${escapeHtml(p.usuario || "")}</span>
          </td>

          <td>
            <span class="badge-fecha">${formatDate(p.fecha_prestamo)}</span>
          </td>

          <td>
            <span class="badge-fecha ${vencido ? "badge-vencido" : ""}">
              ${formatDate(p.fecha_devolucion)}
            </span>
            ${vencido ? '<span class="badge-vencido-text">Vencido</span>' : ""}
          </td>

          <td>${escapeHtml(p.entregado_por || "")}</td>

          <td>${escapeHtml(p.recibido_por || "")}</td>

          <td>
            <div class="acciones-table">
              <button class="btn-action btn-action-view"
                onclick="PrestamosModule.verDetalle(${p.id_prestamo})"
                title="Ver detalle">
                <i class="bi bi-eye-fill"></i>
              </button>

              <button class="btn-action btn-action-delete"
                onclick="PrestamosModule.confirmDel(${p.id_prestamo})"
                title="Eliminar">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  async openModal() {
    document.getElementById("pUsuario").innerHTML = `<option value="">Cargando...</option>`;
    document.getElementById("pHerramienta").innerHTML = `<option value="">Cargando...</option>`;
    document.getElementById("pCantidad").value = 1;
    document.getElementById("pEstadoFisico").value = "Buen estado";

    const fechaInput = document.getElementById("pFechaDevolucion");

    if (fechaInput) {
      const hoy = new Date();
      const manana = new Date();

      manana.setDate(hoy.getDate() + 1);

      const hoyFormato = hoy.toISOString().split("T")[0];
      const mananaFormato = manana.toISOString().split("T")[0];

      fechaInput.min = hoyFormato;
      fechaInput.value = mananaFormato;
    }

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

    const fechaInput = document.getElementById("pFechaDevolucion");
    let fecha_devolucion = fechaInput ? fechaInput.value : "";

    if (!fecha_devolucion) {
      await Swal.fire({
        title: "Fecha requerida",
        text: "Selecciona una fecha de devolución para registrar el préstamo.",
        icon: "warning",
        confirmButtonColor: "#6366f1",
        background: "#1e293b",
        color: "#fff"
      });
      return;
    }

    if (!id_usuario) return showToast("Selecciona un usuario", "error");
    if (!id_herramienta) return showToast("Selecciona una herramienta", "error");
    if (!cantidad || cantidad <= 0) return showToast("La cantidad debe ser mayor a 0", "error");

    try {
      await http("/api/prestamos", "POST", {
        id_usuario,
        fecha_devolucion,
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

      showToast("Préstamo registrado correctamente", "success");

      closeOverlay("modalPrestamoOverlay");
      await this.load();

    } catch (e) {
      showToast(e.message, "error");
    }
  },

  async verDetalle(id) {
    try {
      const { data } = await http(`/api/prestamos/${id}`);
      const vencido = isVencido(data.fecha_devolucion);

      setText("detallePrestamoTitle", `Préstamo #${data.id_prestamo}`);

      const detalleHtml = (data.detalle || []).map(d => `
        <div class="detalle-item">
          <div class="detalle-item-title">
            <i class="bi bi-tools"></i>
            ${escapeHtml(d.nombre || "")}
          </div>

          <div class="detalle-grid">
            <div>
              <span class="detalle-label">Cantidad prestada</span>
              <strong>${d.cantidad_prestada}</strong>
            </div>

            <div>
              <span class="detalle-label">Cantidad devuelta</span>
              <strong>${d.cantidad_devuelta}</strong>
            </div>

            <div>
              <span class="detalle-label">Estado físico</span>
              <strong>${escapeHtml(d.estado_fisico || "")}</strong>
            </div>
          </div>
        </div>
      `).join("");

      document.getElementById("detallePrestamoBody").innerHTML = `
        <div class="detalle-grid">
          <div>
            <span class="detalle-label">Usuario</span>
            <strong>${escapeHtml(data.usuario || "")}</strong>
          </div>

          <div>
            <span class="detalle-label">Fecha préstamo</span>
            <strong>${formatDate(data.fecha_prestamo)}</strong>
          </div>

          <div>
            <span class="detalle-label">Fecha devolución</span>
            <strong>${formatDate(data.fecha_devolucion)}</strong>
            ${vencido ? '<span class="badge-vencido-text">Vencido</span>' : ""}
          </div>

          <div>
            <span class="detalle-label">Entregado por</span>
            <strong>${escapeHtml(data.nombre_entregado_por || "")}</strong>
          </div>

          <div>
            <span class="detalle-label">Recibido por</span>
            <strong>${escapeHtml(data.nombre_recibido_por || "")}</strong>
          </div>
        </div>

        <hr>

        ${detalleHtml || "<p>No hay detalle registrado</p>"}
      `;

      openOverlay("modalDetallePrestamoOverlay");

    } catch (error) {
      showToast("Error al cargar detalle: " + error.message, "error");
    }
  },

  async confirmDel(id) {
    const result = await Swal.fire({
      title: "¿Eliminar préstamo?",
      text: "Si el préstamo tiene herramientas pendientes, el stock será devuelto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#64748b",
      background: "#1e293b",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      await http(`/api/prestamos/${id}`, "DELETE");

      showToast("Préstamo eliminado correctamente", "success");
      await this.load();
    } catch (e) {
      showToast(e.message, "error");
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

    document.getElementById("btnCloseDetallePrestamo")
      ?.addEventListener("click", () => closeOverlay("modalDetallePrestamoOverlay"));

    document.getElementById("btnCerrarDetallePrestamo")
      ?.addEventListener("click", () => closeOverlay("modalDetallePrestamoOverlay"));

    document.getElementById("modalPrestamoOverlay")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalPrestamoOverlay") {
          closeOverlay("modalPrestamoOverlay");
        }
      });

    document.getElementById("modalDetallePrestamoOverlay")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalDetallePrestamoOverlay") {
          closeOverlay("modalDetallePrestamoOverlay");
        }
      });
  }
};