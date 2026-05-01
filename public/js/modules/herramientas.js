"use strict";

const HerramientasModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById("bodyHerramientas").innerHTML =
      `<tr><td colspan="9" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;

    try {
      const { data } = await http("/api/herramientas");
      AppState.herramientas = data;
      this._render(data);
      updateBadges?.();
    } catch (e) {
      showToast("Error al cargar herramientas: " + e.message, "error");
    }
  },

  async _loadMarcasSelect() {
    try {
      const { data } = await http("/api/marcas");
      const select = document.getElementById("hMarca");

      select.innerHTML = `
        <option value="">Seleccione marca</option>
        ${data
          .map(
            (m) => `
          <option value="${m.id_marca}">
            ${escapeHtml(m.nombre_marca)}
          </option>
        `,
          )
          .join("")}
      `;
    } catch (e) {
      showToast("Error al cargar marcas: " + e.message, "error");
    }
  },

  _render(lista) {
    setText(
      "totalHerramientasLabel",
      `${lista.length} herramienta(s) encontrada(s)`,
    );

    const tbody = document.getElementById("bodyHerramientas");

    if (!lista.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-state">
              <i class="bi bi-tools"></i>
              <p>No hay herramientas registradas</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = lista
      .map((h, i) => {
        const estado = (h.estado || h.nombre_estado || "").toLowerCase();
        const status = (h.status || h.nombre_status || "").toLowerCase();

        return `
        <tr>
          <td>${String(i + 1).padStart(2, "0")}</td>

          <td class="fw-600">${escapeHtml(h.nombre || "")}</td>

          <td>${escapeHtml(h.nombre_marca || h.marca || "Sin marca")}</td>

          <td>${escapeHtml(h.serie || "")}</td>

          <td>
            <span class="badge-stock">${h.stock}</span>
          </td>

          <td>${escapeHtml(h.categoria || h.nombre_categoria || h.id_categoria || "")}</td>

          <td>
            <span class="badge-estado ${
              estado.includes("bueno") || estado.includes("nueva")
                ? "badge-bueno"
                : "badge-danado"
            }">
              ${escapeHtml(h.estado || h.nombre_estado || h.id_estado || "")}
            </span>
          </td>

          <td>
            <span class="badge-status ${
              status.includes("disponible")
                ? "badge-disponible"
                : "badge-prestado"
            }">
              ${escapeHtml(h.status || h.nombre_status || h.id_status || "")}
            </span>
          </td>

          <td>
            <div class="acciones-table">
              <button class="btn-action btn-action-edit"
                onclick="HerramientasModule.openEdit(${h.id_herramienta})"
                title="Editar">
                <i class="bi bi-pencil-fill"></i>
              </button>

              <button class="btn-action btn-action-delete"
                onclick="HerramientasModule.confirmDel(${h.id_herramienta}, '${escapeHtml(h.nombre || "")}')"
                title="Eliminar">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join("");
  },

  _filter() {
    const search =
      document.getElementById("searchHerramienta")?.value.toLowerCase() || "";

    this._render(
      AppState.herramientas.filter(
        (h) =>
          String(h.nombre || "")
            .toLowerCase()
            .includes(search) ||
          String(h.serie || "")
            .toLowerCase()
            .includes(search) ||
          String(h.nombre_marca || h.marca || "")
            .toLowerCase()
            .includes(search),
      ),
    );
  },

  async _openModal(mode, herramienta = null) {
    const isEdit = mode === "edit";

    await this._loadMarcasSelect();

    setText(
      "modalHerramientaTitle",
      isEdit ? "Editar Herramienta" : "Nueva Herramienta",
    );

    document.getElementById("herramientaId").value = isEdit
      ? herramienta.id_herramienta
      : "";
    document.getElementById("hNombre").value = isEdit ? herramienta.nombre : "";
    document.getElementById("hMarca").value = isEdit
      ? herramienta.id_marca || ""
      : "";
    document.getElementById("hSerie").value = isEdit ? herramienta.serie : "";
    document.getElementById("hStock").value = isEdit ? herramienta.stock : 0;
    document.getElementById("hCategoria").value = isEdit
      ? herramienta.id_categoria
      : "";
    document.getElementById("hEstado").value = isEdit
      ? herramienta.id_estado
      : "";
    document.getElementById("hStatus").value = isEdit
      ? herramienta.id_status
      : "";

    clearErrors([
      "hNombre",
      "hMarca",
      "hSerie",
      "hCategoria",
      "hEstado",
      "hStatus",
    ]);
    openOverlay("modalHerramientaOverlay");
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/herramientas/${id}`);
      await this._openModal("edit", data);
    } catch (e) {
      showToast("No se pudo cargar la herramienta: " + e.message, "error");
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
      await http(`/api/herramientas/${id}`, "DELETE");

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

    const id = document.getElementById("herramientaId").value;
    const isEdit = !!id;

    const body = {
      nombre: document.getElementById("hNombre").value.trim(),
      id_marca: document.getElementById("hMarca").value,
      serie: document.getElementById("hSerie").value.trim(),
      stock: parseInt(document.getElementById("hStock").value || 0),
      id_categoria: document.getElementById("hCategoria").value,
      id_estado: document.getElementById("hEstado").value,
      id_status: document.getElementById("hStatus").value,
    };

    setLoading(
      "btnSaveHerramienta",
      "btnSaveHerramientaText",
      "btnSaveHerramientaSpinner",
      true,
    );

    try {
      await http(
        isEdit ? `/api/herramientas/${id}` : "/api/herramientas",
        isEdit ? "PUT" : "POST",
        body,
      );

      showToast(
        `Herramienta ${isEdit ? "actualizada" : "creada"} correctamente`,
        "success",
      );
      closeOverlay("modalHerramientaOverlay");
      await this.load();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(
        "btnSaveHerramienta",
        "btnSaveHerramientaText",
        "btnSaveHerramientaSpinner",
        false,
      );
    }
  },

  _validate() {
    clearErrors([
      "hNombre",
      "hMarca",
      "hSerie",
      "hCategoria",
      "hEstado",
      "hStatus",
    ]);

    let ok = true;

    if (!document.getElementById("hNombre").value.trim()) {
      setError("hNombre", "err-hNombre", "El nombre es requerido");
      ok = false;
    }

    if (!document.getElementById("hMarca").value) {
      setError("hMarca", "err-hMarca", "Selecciona una marca");
      ok = false;
    }

    if (!document.getElementById("hSerie").value.trim()) {
      setError("hSerie", "err-hSerie", "La serie es requerida");
      ok = false;
    }

    const stock = document.getElementById("hStock").value;
    if (stock === "" || isNaN(stock) || parseInt(stock) < 0) {
      setError("hStock", "err-hStock", "El stock debe ser 0 o mayor");
      ok = false;
    }

    if (!document.getElementById("hCategoria").value) {
      setError("hCategoria", "err-hCategoria", "Selecciona una categoría");
      ok = false;
    }

    if (!document.getElementById("hEstado").value) {
      setError("hEstado", "err-hEstado", "Selecciona un estado");
      ok = false;
    }

    if (!document.getElementById("hStatus").value) {
      setError("hStatus", "err-hStatus", "Selecciona un status");
      ok = false;
    }

    return ok;
  },

  _bindEvents() {
    document.getElementById("btnNuevaHerramienta")?.addEventListener("click", () => this._openModal("new"));
    document.getElementById("btnSaveHerramienta")?.addEventListener("click", () => this._save());
    document.getElementById("btnCancelHerramienta")?.addEventListener("click", () =>closeOverlay("modalHerramientaOverlay"),);
    document.getElementById("btnCloseModalHerramienta")?.addEventListener("click", () =>closeOverlay("modalHerramientaOverlay"),);
    document.getElementById("btnRefreshHerramientas")?.addEventListener("click", () => this.load());
    document.getElementById("searchHerramienta")?.addEventListener("input", () => this._filter());
    document.getElementById("modalHerramientaOverlay")?.addEventListener("click", (e) => {if (e.target.id === "modalHerramientaOverlay") {closeOverlay("modalHerramientaOverlay");
        }
      });
  },
};
