'use strict';

const UsuariosModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    const tbody = document.getElementById("bodyUsuarios");

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <div class="spinner-custom"></div>
        </td>
      </tr>
    `;

    try {
      const { data } = await http("/api/usuarios");

      AppState.usuarios = data;
      this._render(data);
      updateBadges?.();

    } catch (error) {
      showToast("Error al cargar usuarios: " + error.message, "error");
    }
  },

  _render(lista) {
  setText("totalUsuariosLabel", `${lista.length} usuario(s) encontrado(s)`);

  const tbody = document.getElementById("bodyUsuarios");

  if (!lista.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="bi bi-people"></i>
            <p>No hay usuarios registrados</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((u, i) => {

    const estado = (u.estado || "").toLowerCase();
    const turno = (u.turno || "").toLowerCase();
    const rol = (u.nombre_rol || u.rol || "").toLowerCase();

    return `
      <tr>
        <td>${String(i + 1).padStart(2, "0")}</td>

        <td class="fw-600">${escapeHtml(u.nombres_completos || "")}</td>

        <td>${escapeHtml(u.dni || "")}</td>

        <!-- 🔥 TURNO BONITO -->
        <td>
          <span class="badge-turno">
            ${escapeHtml(u.turno || "")}
          </span>
        </td>

        <!-- 🔥 ESTADO CON COLOR -->
        <td>
          <span class="badge-user-estado ${
            estado.includes("vigente") ? "badge-vigente" : "badge-baja"
          }">
            ${escapeHtml(u.estado || "")}
          </span>
        </td>

        <td>${escapeHtml(u.correo || "")}</td>

        <!-- 🔥 ROL BONITO -->
        <td>
          <span class="badge-user-rol">
            ${escapeHtml(u.nombre_rol || u.rol || "")}
          </span>
        </td>

        <!-- 🔥 ACCIONES CENTRADAS -->
        <td>
          <div class="acciones-table">
            <button class="btn-action btn-action-edit"
              onclick="UsuariosModule.openEdit(${u.id_usuario})"
              title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>

            <button class="btn-action btn-action-delete"
              onclick="UsuariosModule.confirmDel(${u.id_usuario}, '${escapeHtml(u.nombres_completos || "")}')"
              title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
},

  _filter() {
    const search = document.getElementById("searchUsuario")?.value.toLowerCase() || "";

    const filtrados = AppState.usuarios.filter(u =>
      String(u.nombres_completos || "").toLowerCase().includes(search) ||
      String(u.dni || "").toLowerCase().includes(search) ||
      String(u.turno || "").toLowerCase().includes(search) ||
      String(u.estado || "").toLowerCase().includes(search) ||
      String(u.correo || "").toLowerCase().includes(search)
    );

    this._render(filtrados);
  },

  _openModal(mode, usuario = null) {
    const isEdit = mode === "edit";

    setText("modalUsuarioTitle", isEdit ? "Editar Usuario" : "Nuevo Usuario");

    document.getElementById("usuarioId").value = isEdit ? usuario.id_usuario : "";
    document.getElementById("uNombres").value = isEdit ? usuario.nombres_completos : "";
    document.getElementById("uDni").value = isEdit ? usuario.dni : "";
    document.getElementById("uTurno").value = isEdit ? usuario.turno : "";
    document.getElementById("uEstado").value = isEdit ? usuario.estado : "vigente";
    document.getElementById("uCorreo").value = isEdit ? usuario.correo || "" : "";
    document.getElementById("uPassword").value = "";
    document.getElementById("uRol").value = isEdit ? usuario.id_rol || "" : "";

    clearErrors(["uNombres", "uDni", "uTurno", "uEstado", "uCorreo", "uPassword", "uRol"]);

    openOverlay("modalUsuarioOverlay");
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/usuarios/${id}`);
      this._openModal("edit", data);
    } catch (e) {
      showToast("No se pudo cargar el usuario: " + e.message, "error");
    }
  },

  async confirmDel(id, name) {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminará el usuario "${name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#64748b",
      background: "#1e293b",
      color: "#fff"
    });

    if (!result.isConfirmed) return;

    try {
      await http(`/api/usuarios/${id}`, "DELETE");

      await Swal.fire({
        title: "Eliminado",
        text: `"${name}" fue eliminado correctamente`,
        icon: "success",
        confirmButtonColor: "#6366f1",
        background: "#1e293b",
        color: "#fff"
      });

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

  async _save() {
    if (!this._validate()) return;

    const id = document.getElementById("usuarioId").value;
    const isEdit = !!id;

    const body = {
      nombres_completos: document.getElementById("uNombres").value.trim(),
      dni: document.getElementById("uDni").value.trim(),
      turno: document.getElementById("uTurno").value,
      estado: document.getElementById("uEstado").value,
      correo: document.getElementById("uCorreo").value.trim(),
      contraseña: document.getElementById("uPassword").value.trim(),
      id_rol: document.getElementById("uRol").value
    };

    setLoading("btnSaveUsuario", "btnSaveUsuarioText", "btnSaveUsuarioSpinner", true);

    try {
      await http(
        isEdit ? `/api/usuarios/${id}` : "/api/usuarios",
        isEdit ? "PUT" : "POST",
        body
      );

      await Swal.fire({
        title: isEdit ? "Usuario actualizado" : "Usuario creado",
        text: "La operación se realizó correctamente",
        icon: "success",
        confirmButtonColor: "#6366f1",
        background: "#1e293b",
        color: "#fff"
      });

      closeOverlay("modalUsuarioOverlay");
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
    } finally {
      setLoading("btnSaveUsuario", "btnSaveUsuarioText", "btnSaveUsuarioSpinner", false);
    }
  },

  _validate() {
    clearErrors(["uNombres", "uDni", "uTurno", "uEstado", "uCorreo", "uPassword", "uRol"]);

    let ok = true;

    if (!document.getElementById("uNombres").value.trim()) {
      setError("uNombres", "err-uNombres", "Los nombres completos son requeridos");
      ok = false;
    }

    if (!document.getElementById("uDni").value.trim()) {
      setError("uDni", "err-uDni", "El DNI es requerido");
      ok = false;
    } else if (!/^\d{8}$/.test(document.getElementById("uDni").value.trim())) {
      setError("uDni", "err-uDni", "El DNI debe tener exactamente 8 números");
      ok = false;
    }

    if (!document.getElementById("uTurno").value) {
      setError("uTurno", "err-uTurno", "Selecciona un turno");
      ok = false;
    }

    if (!document.getElementById("uEstado").value) {
      setError("uEstado", "err-uEstado", "Selecciona un estado");
      ok = false;
    }

    if (!document.getElementById("uRol").value) {
      setError("uRol", "err-uRol", "Selecciona un rol");
      ok = false;
    }

    return ok;
  },

  _bindEvents() {
    document.getElementById("btnNuevoUsuario")?.addEventListener("click", () => this._openModal("new"));
    document.getElementById("btnSaveUsuario")?.addEventListener("click", () => this._save());
    document.getElementById("btnCancelUsuario")?.addEventListener("click", () => closeOverlay("modalUsuarioOverlay"));
    document.getElementById("btnCloseModalUsuario")?.addEventListener("click", () => closeOverlay("modalUsuarioOverlay"));
    document.getElementById("btnRefreshUsuarios")?.addEventListener("click", () => this.load());
    document.getElementById("searchUsuario")?.addEventListener("input", () => this._filter());

    document.getElementById("modalUsuarioOverlay")?.addEventListener("click", e => {
      if (e.target.id === "modalUsuarioOverlay") {
        closeOverlay("modalUsuarioOverlay");
      }
    });
  }
};