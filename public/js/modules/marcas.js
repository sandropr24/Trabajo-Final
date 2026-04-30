"use strict";

const MarcasModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById("bodyMarcas").innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-5">
          <div class="spinner-custom"></div>
        </td>
      </tr>
    `;

    try {
      const { data } = await http("/api/marcas");
      AppState.marcas = data;
      this._render(data);
      updateBadges?.();
    } catch (e) {
      showToast("Error al cargar marcas: " + e.message, "error");
    }
  },

  _render(lista) {
    setText("totalMarcasLabel", `${lista.length} marca(s) registrada(s)`);

    const tbody = document.getElementById("bodyMarcas");

    if (!lista.length) {
      tbody.innerHTML = `
      <tr>
        <td colspan="3">
          <div class="empty-state">
            <i class="bi bi-bookmark-x"></i>
            <p>No hay marcas registradas</p>
          </div>
        </td>
      </tr>
    `;
      return;
    }

    tbody.innerHTML = lista
      .map(
        (m, i) => `
    <tr>
      <td>${String(i + 1).padStart(2, "0")}</td>
      <td class="fw-600">${escapeHtml(m.nombre_marca)}</td>
      <td>
        <button class="btn-action btn-action-edit"
          onclick="MarcasModule.openEdit(${m.id_marca})"
          title="Editar">
          <i class="bi bi-pencil-fill"></i>
        </button>

        <button class="btn-action btn-action-delete"
          onclick="MarcasModule.confirmDel(${m.id_marca}, '${escapeHtml(m.nombre_marca)}')"
          title="Eliminar">
          <i class="bi bi-trash3-fill"></i>
        </button>
      </td>
    </tr>
  `,
      )
      .join("");
  },

  _filter() {
    const search =
      document.getElementById("searchMarca")?.value.toLowerCase() || "";

    this._render(
      AppState.marcas.filter((m) =>
        m.nombre_marca.toLowerCase().includes(search),
      ),
    );
  },

  _openModal(mode, marca = null) {
    const isEdit = mode === "edit";

    setText("modalMarcaTitle", isEdit ? "Editar Marca" : "Nueva Marca");

    document.getElementById("marcaId").value = isEdit ? marca.id_marca : "";
    document.getElementById("mNombre").value = isEdit ? marca.nombre_marca : "";

    clearErrors(["mNombre"]);
    openOverlay("modalMarcaOverlay");
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/marcas/${id}`);
      this._openModal("edit", data);
    } catch (e) {
      showToast("No se pudo cargar la marca: " + e.message, "error");
    }
  },

  async confirmDel(id, name) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará "${name}"`,
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
      await http(`/api/marcas/${id}`, "DELETE");

      await Swal.fire({
        title: "Eliminado",
        text: `"${name}" fue eliminada`,
        icon: "success",
        confirmButtonColor: "#6366f1",
        background: "#1e293b",
        color: "#fff",
      });

      await this.load();
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#1e293b",
        color: "#fff",
      });
    }
  },

  async _save() {
    if (!this._validate()) return;

    const id = document.getElementById("marcaId").value;
    const isEdit = !!id;

    const body = {
      nombre_marca: document.getElementById("mNombre").value.trim(),
    };

    setLoading("btnSaveMarca", "btnSaveMarcaText", "btnSaveMarcaSpinner", true);

    try {
      await http(
        isEdit ? `/api/marcas/${id}` : "/api/marcas",
        isEdit ? "PUT" : "POST",
        body,
      );

      showToast(
        `Marca ${isEdit ? "actualizada" : "creada"} correctamente`,
        "success",
      );
      closeOverlay("modalMarcaOverlay");
      await this.load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(
        "btnSaveMarca",
        "btnSaveMarcaText",
        "btnSaveMarcaSpinner",
        false,
      );
    }
  },

  _validate() {
    clearErrors(["mNombre"]);

    let ok = true;

    if (!document.getElementById("mNombre").value.trim()) {
      setError("mNombre", "err-mNombre", "El nombre es requerido");
      ok = false;
    }

    return ok;
  },

  _bindEvents() {
    document
      .getElementById("btnNuevaMarca")
      ?.addEventListener("click", () => this._openModal("new"));
    document
      .getElementById("btnSaveMarca")
      ?.addEventListener("click", () => this._save());
    document
      .getElementById("btnCancelMarca")
      ?.addEventListener("click", () => closeOverlay("modalMarcaOverlay"));
    document
      .getElementById("btnCloseModalMarca")
      ?.addEventListener("click", () => closeOverlay("modalMarcaOverlay"));
    document
      .getElementById("btnRefreshMarcas")
      ?.addEventListener("click", () => this.load());
    document
      .getElementById("searchMarca")
      ?.addEventListener("input", () => this._filter());

    document
      .getElementById("modalMarcaOverlay")
      ?.addEventListener("click", (e) => {
        if (e.target.id === "modalMarcaOverlay") {
          closeOverlay("modalMarcaOverlay");
        }
      });
  },
};
