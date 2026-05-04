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

  getEstado(p) {
    if (Number(p.devuelto) === 1) {
      return `<span class="badge-success">Devuelto</span>`;
    }

    if (isVencido(p.fecha_devolucion)) {
      return `<span class="badge-danger">Vencido</span>`;
    }

    return `<span class="badge-warning">Pendiente</span>`;
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
      const devuelto = Number(p.devuelto) === 1;

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
            <span class="badge-fecha ${vencido && !devuelto ? "badge-vencido" : ""}">
              ${formatDate(p.fecha_devolucion)}
            </span>
            ${vencido && !devuelto ? '<span class="badge-vencido-text">Vencido</span>' : ""}
          </td>

          <td>${escapeHtml(p.entregado_por || "")}</td>

          <td class="text-center">
            ${this.getEstado(p)}
          </td>

          <td>
            <div class="acciones-table">
              <button class="btn-action btn-action-view"
                onclick="PrestamosModule.verDetalle(${p.id_prestamo})"
                title="Ver detalle">
                <i class="bi bi-eye-fill"></i>
              </button>

              <button class="btn-action btn-action-edit"
                onclick="PrestamosModule.openDevolver(${p.id_prestamo})"
                title="Registrar devolución">
                <i class="bi bi-arrow-return-left"></i>
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

      fechaInput.min = hoy.toISOString().split("T")[0];
      fechaInput.value = manana.toISOString().split("T")[0];
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
    const id_herramienta = document.getElementById("pHerramienta").value;
    const cantidad = Number(document.getElementById("pCantidad").value);
    const estado_fisico = document.getElementById("pEstadoFisico").value.trim();

    const fecha_devolucion = document.getElementById("pFechaDevolucion")?.value || "";

    if (!fecha_devolucion) {
      await Swal.fire({
        title: "Fecha requerida",
        text: "Selecciona una fecha de devolución",
        icon: "warning",
        confirmButtonColor: "#6366f1"
      });
      return;
    }

    if (!id_usuario) return showToast("Selecciona un usuario", "error");
    if (!id_herramienta) return showToast("Selecciona una herramienta", "error");
    if (!cantidad || cantidad <= 0) return showToast("Cantidad inválida", "error");

    try {
      await http("/api/prestamos", "POST", {
        id_usuario,
        fecha_devolucion,
        entregado_por: entregado_por || null,
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

      const todoDevuelto = (data.detalle || []).every(d =>
        Number(d.cantidad_prestada) === Number(d.cantidad_devuelta)
      );

      setText("detallePrestamoTitle", `Préstamo #${data.id_prestamo}`);

      const detalleHtml = (data.detalle || []).map(d => {
        const prestada = Number(d.cantidad_prestada);
        const devuelta = Number(d.cantidad_devuelta);
        const pendiente = prestada - devuelta;

        return `
          <div class="detalle-item">
            <div class="detalle-item-title">
              <i class="bi bi-tools"></i>
              ${escapeHtml(d.nombre || "")}
            </div>

            <div class="detalle-grid">
              <div>
                <span class="detalle-label">Cantidad prestada</span>
                <strong>${prestada}</strong>
              </div>

              <div>
                <span class="detalle-label">Cantidad devuelta</span>
                <strong>${devuelta}</strong>
              </div>

              <div>
                <span class="detalle-label">Pendiente</span>
                <strong>${pendiente}</strong>
              </div>

              <div>
                <span class="detalle-label">Estado físico</span>
                <strong>${escapeHtml(d.estado_fisico || "")}</strong>
              </div>
            </div>
          </div>
        `;
      }).join("");

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
            ${vencido && !todoDevuelto ? '<span class="badge-vencido-text">Vencido</span>' : ""}
          </div>

          <div>
            <span class="detalle-label">Entregado por</span>
            <strong>${escapeHtml(data.nombre_entregado_por || "")}</strong>
          </div>

          <div>
            <span class="detalle-label">Estado</span>
            ${
              todoDevuelto
                ? '<strong class="badge-success">Devuelto</strong>'
                : vencido
                  ? '<strong class="badge-danger">Vencido</strong>'
                  : '<strong class="badge-warning">Pendiente</strong>'
            }
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

  async openDevolver(id) {
    try {
      const { data } = await http(`/api/prestamos/${id}`);

      const todoDevuelto = (data.detalle || []).every(d =>
        Number(d.cantidad_prestada) === Number(d.cantidad_devuelta)
      );

      if (todoDevuelto) {
        return showToast("Este préstamo ya fue devuelto completamente", "warning");
      }

      document.getElementById("devolverPrestamoId").value = id;
      setText("devolverPrestamoTitle", `Registrar devolución #${id}`);

      const { data: usuarios } = await http("/api/usuarios");

      document.getElementById("dRecibidoPor").innerHTML = `
        <option value="">Seleccione usuario</option>
        ${usuarios.map(u => `
          <option value="${u.id_usuario}">
            ${escapeHtml(u.nombres_completos)}
          </option>
        `).join("")}
      `;

      document.getElementById("devolverHerramientasBody").innerHTML =
        (data.detalle || []).map(d => {
          const prestada = Number(d.cantidad_prestada);
          const devuelta = Number(d.cantidad_devuelta);
          const pendiente = prestada - devuelta;

          return `
            <div class="detalle-item">
              <div class="detalle-item-title">
                <i class="bi bi-tools"></i>
                ${escapeHtml(d.nombre || "")}
              </div>

              <div class="detalle-grid">
                <div>
                  <span class="detalle-label">Prestado</span>
                  <strong>${prestada}</strong>
                </div>

                <div>
                  <span class="detalle-label">Ya devuelto</span>
                  <strong>${devuelta}</strong>
                </div>

                <div>
                  <span class="detalle-label">Pendiente</span>
                  <strong>${pendiente}</strong>
                </div>
              </div>

              <label class="form-label-custom">Cantidad total devuelta</label>
              <input
                type="number"
                class="input-custom input-devolver"
                data-id-herramienta="${d.id_herramienta}"
                min="${devuelta}"
                max="${prestada}"
                value="${prestada}"
                ${pendiente === 0 ? "disabled" : ""}
              />
            </div>
          `;
        }).join("");

      openOverlay("modalDevolverPrestamoOverlay");
    } catch (error) {
      showToast("Error al abrir devolución: " + error.message, "error");
    }
  },

  async saveDevolucion() {
    const id = document.getElementById("devolverPrestamoId").value;
    const recibido_por = document.getElementById("dRecibidoPor").value;

    if (!recibido_por) {
      return showToast("Selecciona quién recibió la devolución", "error");
    }

    const herramientas = [...document.querySelectorAll(".input-devolver")]
      .filter(input => !input.disabled)
      .map(input => ({
        id_herramienta: input.dataset.idHerramienta,
        cantidad_devuelta: Number(input.value)
      }));

    if (!herramientas.length) {
      return showToast("No hay herramientas pendientes por devolver", "warning");
    }

    try {
      await http(`/api/prestamos/${id}/devolver`, "PUT", {
        recibido_por,
        herramientas
      });

      showToast("Devolución registrada correctamente", "success");

      closeOverlay("modalDevolverPrestamoOverlay");
      await this.load();
    } catch (error) {
      showToast(error.message, "error");
    }
  },

  async confirmDel(id) {
    const result = await Swal.fire({
      title: "¿Eliminar préstamo?",
      text: "El stock será devuelto automáticamente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
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
      String(p.devuelto ? "devuelto" : "").toLowerCase().includes(search)
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

    document.getElementById("btnSaveDevolverPrestamo")
      ?.addEventListener("click", () => this.saveDevolucion());

    document.getElementById("btnCancelDevolverPrestamo")
      ?.addEventListener("click", () => closeOverlay("modalDevolverPrestamoOverlay"));

    document.getElementById("btnCloseDevolverPrestamo")
      ?.addEventListener("click", () => closeOverlay("modalDevolverPrestamoOverlay"));

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

    document.getElementById("modalDevolverPrestamoOverlay")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalDevolverPrestamoOverlay") {
          closeOverlay("modalDevolverPrestamoOverlay");
        }
      });
  }
};