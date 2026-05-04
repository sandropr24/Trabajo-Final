'use strict';

function formatDate(fecha) {
  if (!fecha) return "";

  return new Date(fecha).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

const ComprasModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById("bodyCompras");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5">
          <div class="spinner-custom"></div>
        </td>
      </tr>
    `;

    try {
      const { data } = await http("/api/compras");
      AppState.compras = data;
      this._render(data);
    } catch (error) {
      showToast("Error al cargar compras: " + error.message, "error");
    }
  },

  _render(lista) {
    setText("totalComprasLabel", `${lista.length} compra(s) encontrada(s)`);

    const tbody = document.getElementById("bodyCompras");

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="bi bi-cart"></i>
              <p>No hay compras registradas</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map((c, i) => `
  <tr>
    <td class="text-center">${String(i + 1).padStart(2, "0")}</td>

    <td class="fw-600">${escapeHtml(c.proveedor || "")}</td>

    <td>${escapeHtml(c.usuario || "")}</td>

    <td class="text-center">
      <span class="badge-fecha">${formatDate(c.fecha_compra)}</span>
    </td>

    <td class="text-center">
      <span class="badge-total">
        S/ ${Number(c.total || 0).toFixed(2)}
      </span>
    </td>

    <td class="text-center">
      <div class="acciones-table">
        <button class="btn-action btn-action-view"
          onclick="ComprasModule.verDetalle(${c.id_compra})"
          title="Ver detalle">
          <i class="bi bi-eye-fill"></i>
        </button>
      </div>
    </td>
  </tr>
`).join("");
  },

  async openModal() {
    document.getElementById("cProveedor").innerHTML = `<option>Cargando...</option>`;
    document.getElementById("cUsuario").innerHTML = `<option>Cargando...</option>`;
    document.getElementById("cHerramienta").innerHTML = `<option>Cargando...</option>`;

    openOverlay("modalCompraOverlay");

    try {
      const { data: proveedores } = await http("/api/proveedores");
      const { data: usuarios } = await http("/api/usuarios");
      const { data: herramientas } = await http("/api/herramientas");

      document.getElementById("cProveedor").innerHTML = `
        <option value="">Seleccione proveedor</option>
        ${proveedores.map(p => `
          <option value="${p.id_proveedor}">
            ${escapeHtml(p.nombre)}
          </option>
        `).join("")}
      `;

      document.getElementById("cUsuario").innerHTML = `
        <option value="">Seleccione usuario</option>
        ${usuarios.map(u => `
          <option value="${u.id_usuario}">
            ${escapeHtml(u.nombres_completos)}
          </option>
        `).join("")}
      `;

      document.getElementById("cHerramienta").innerHTML = `
        <option value="">Seleccione herramienta</option>
        ${herramientas.map(h => `
          <option value="${h.id_herramienta}">
            ${escapeHtml(h.nombre)}
          </option>
        `).join("")}
      `;

    } catch (error) {
      showToast("Error cargando datos", "error");
    }
  },

  async save() {
    const id_proveedor = document.getElementById("cProveedor").value;
    const id_usuario = document.getElementById("cUsuario").value;
    const fecha_compra = document.getElementById("cFechaCompra").value;
    const id_herramienta = document.getElementById("cHerramienta").value;
    const cantidad = Number(document.getElementById("cCantidad").value);
    const precio = Number(document.getElementById("cPrecio").value);

    if (!id_proveedor) return showToast("Selecciona proveedor", "error");
    if (!id_usuario) return showToast("Selecciona usuario", "error");
    if (!fecha_compra) return showToast("Selecciona fecha", "error");
    if (!id_herramienta) return showToast("Selecciona herramienta", "error");
    if (!cantidad || cantidad <= 0) return showToast("Cantidad inválida", "error");

    try {
      await http("/api/compras", "POST", {
        id_proveedor,
        id_usuario,
        fecha_compra,
        herramientas: [
          {
            id_herramienta,
            cantidad,
            precio
          }
        ]
      });

      showToast("Compra registrada correctamente", "success");

      closeOverlay("modalCompraOverlay");
      await this.load();

    } catch (error) {
      showToast(error.message, "error");
    }
  },

  async verDetalle(id) {
    try {
      const { data } = await http(`/api/compras/${id}`);

      setText("detalleCompraTitle", `Compra #${data.id_compra}`);

      document.getElementById("detalleCompraBody").innerHTML = `
        <div class="detalle-grid">
          <div>
            <span class="detalle-label">Proveedor</span>
            <strong>${escapeHtml(data.proveedor || "")}</strong>
          </div>

          <div>
            <span class="detalle-label">Usuario</span>
            <strong>${escapeHtml(data.usuario || "")}</strong>
          </div>

          <div>
            <span class="detalle-label">Fecha</span>
            <strong>${formatDate(data.fecha_compra)}</strong>
          </div>
        </div>

        <hr>

        ${(data.detalle || []).map(d => `
          <div class="detalle-item">
            <div class="detalle-item-title">
              <i class="bi bi-tools"></i>
              ${escapeHtml(d.nombre)}
            </div>

            <div class="detalle-grid">
              <div>
                <span class="detalle-label">Cantidad</span>
                <strong>${d.cantidad}</strong>
              </div>

              <div>
                <span class="detalle-label">Precio</span>
                <strong>S/ ${d.precio}</strong>
              </div>

              <div>
                <span class="detalle-label">Subtotal</span>
                <strong>S/ ${d.subtotal}</strong>
              </div>
            </div>
          </div>
        `).join("")}
      `;

      openOverlay("modalDetalleCompraOverlay");

    } catch (error) {
      showToast("Error al cargar detalle", "error");
    }
  },

  _bindEvents() {
    document.getElementById("btnNuevaCompra")
      ?.addEventListener("click", () => this.openModal());

    document.getElementById("btnSaveCompra")
      ?.addEventListener("click", () => this.save());

    document.getElementById("btnCancelCompra")
      ?.addEventListener("click", () => closeOverlay("modalCompraOverlay"));

    document.getElementById("btnCloseModalCompra")
      ?.addEventListener("click", () => closeOverlay("modalCompraOverlay"));

    document.getElementById("btnRefreshCompras")
      ?.addEventListener("click", () => this.load());

    document.getElementById("btnCloseDetalleCompra")
      ?.addEventListener("click", () => closeOverlay("modalDetalleCompraOverlay"));

    document.getElementById("btnCerrarDetalleCompra")
      ?.addEventListener("click", () => closeOverlay("modalDetalleCompraOverlay"));
  }
};