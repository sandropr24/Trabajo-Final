'use strict';

const ProveedoresModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById("bodyProveedores");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <div class="spinner-custom"></div>
        </td>
      </tr>
    `;

    try {
      const { data } = await http("/api/proveedores");
      AppState.proveedores = data;
      this._render(data);
    } catch (error) {
      showToast("Error al cargar proveedores: " + error.message, "error");
    }
  },

  _render(lista) {
    setText("totalProveedoresLabel", `${lista.length} proveedor(es) encontrado(s)`);

    const tbody = document.getElementById("bodyProveedores");

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <i class="bi bi-truck"></i>
              <p>No hay proveedores registrados</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista.map((p, i) => `
      <tr>
        <td class="text-center">${String(i + 1).padStart(2, "0")}</td>

        <td class="fw-600">${escapeHtml(p.nombre || "")}</td>

        <td>${escapeHtml(p.contacto || "Sin contacto")}</td>

        <td class="text-center">${escapeHtml(p.telefono || "Sin teléfono")}</td>

        <td class="text-center">
          <div class="acciones-table">
            <button class="btn-action btn-action-edit"
              onclick="ProveedoresModule.openModal(${p.id_proveedor})"
              title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn-action btn-action-delete"
              onclick="ProveedoresModule.confirmDel(${p.id_proveedor})"
              title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  },

  async openModal(id = null) {
    document.getElementById("proveedorId").value = "";
    document.getElementById("pNombre").value = "";
    document.getElementById("pContacto").value = "";
    document.getElementById("pTelefono").value = "";

    if (id) {
      try {
        const { data } = await http(`/api/proveedores/${id}`);

        document.getElementById("proveedorId").value = data.id_proveedor;
        document.getElementById("pNombre").value = data.nombre || "";
        document.getElementById("pContacto").value = data.contacto || "";
        document.getElementById("pTelefono").value = data.telefono || "";
      } catch (error) {
        return showToast("Error al cargar proveedor: " + error.message, "error");
      }
    }

    openOverlay("modalProveedorOverlay");
  },

  async save() {
    const id = document.getElementById("proveedorId").value;
    const nombre = document.getElementById("pNombre").value.trim();
    const contacto = document.getElementById("pContacto").value.trim();
    const telefono = document.getElementById("pTelefono").value.trim();

    if (!nombre) {
      return showToast("El nombre del proveedor es obligatorio", "error");
    }

    setLoading("btnSaveProveedor", "btnSaveProveedorText", "btnSaveProveedorSpinner", true);

    try {
      if (id) {
        await http(`/api/proveedores/${id}`, "PUT", { nombre, contacto, telefono });
        showToast("Proveedor actualizado correctamente", "success");
      } else {
        await http("/api/proveedores", "POST", { nombre, contacto, telefono });
        showToast("Proveedor registrado correctamente", "success");
      }

      closeOverlay("modalProveedorOverlay");
      await this.load();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading("btnSaveProveedor", "btnSaveProveedorText", "btnSaveProveedorSpinner", false);
    }
  },
  
  async confirmDel(id) {
    const result = await Swal.fire({
      title: "¿Eliminar proveedor?",
      text: "Esta acción no se puede deshacer.",
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
      await http(`/api/proveedores/${id}`, "DELETE");
      showToast("Proveedor eliminado correctamente", "success");
      await this.load();
    } catch (error) {
      showToast(error.message, "error");
    }
  },

  _filter() {
    const search = document.getElementById("searchProveedor")?.value.toLowerCase() || "";

    const filtrados = AppState.proveedores.filter(p =>
      String(p.nombre || "").toLowerCase().includes(search) ||
      String(p.contacto || "").toLowerCase().includes(search) ||
      String(p.telefono || "").toLowerCase().includes(search)
    );

    this._render(filtrados);
  },

  _bindEvents() {
    document.getElementById("btnNuevoProveedor")
      ?.addEventListener("click", () => this.openModal());

    document.getElementById("btnSaveProveedor")
      ?.addEventListener("click", () => this.save());

    document.getElementById("btnCancelProveedor")
      ?.addEventListener("click", () => closeOverlay("modalProveedorOverlay"));

    document.getElementById("btnCloseModalProveedor")
      ?.addEventListener("click", () => closeOverlay("modalProveedorOverlay"));

    document.getElementById("btnRefreshProveedores")
      ?.addEventListener("click", () => this.load());

    document.getElementById("searchProveedor")
      ?.addEventListener("input", () => this._filter());

    document.getElementById("modalProveedorOverlay")
      ?.addEventListener("click", e => {
        if (e.target.id === "modalProveedorOverlay") {
          closeOverlay("modalProveedorOverlay");
        }
      });
  }
};