function renderDashboard() {
  const container = document.getElementById("pageContainer");

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resumen general del sistema de préstamo de herramientas</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="--c:#6366f1">
          <i class="bi bi-tools"></i>
        </div>
        <div class="stat-value">5</div>
        <div class="stat-label">Herramientas registradas</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="--c:#10b981">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="stat-value">4</div>
        <div class="stat-label">Disponibles</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="--c:#f59e0b">
          <i class="bi bi-arrow-left-right"></i>
        </div>
        <div class="stat-value">5</div>
        <div class="stat-label">Préstamos realizados</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="--c:#ef4444">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-value">5</div>
        <div class="stat-label">Usuarios registrados</div>
      </div>
    </div>

    <div class="card-panel">
      <div class="panel-header">
        <div class="panel-title">Avance del sistema</div>
      </div>

      <div class="modal-body-custom">
        <p><strong>Backend:</strong> Node.js + Express funcionando.</p>
        <p><strong>Base de datos:</strong> MySQL conectada correctamente.</p>
        <p><strong>Módulos:</strong> usuarios, herramientas, préstamos y autenticación.</p>
        <p><strong>Estado:</strong> sistema en desarrollo con pruebas desde Thunder Client.</p>
      </div>
    </div>
  `;
}