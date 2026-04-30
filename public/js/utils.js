function showToast(message, type = "info") {
  const toast = document.createElement("div");

  toast.textContent = message;
  toast.className = `toast toast-${type}`;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";


  //Para evitar ataques como XSS (Cross-Site Scripting).
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

function clearErrors(ids) {
  ids.forEach(id => {
    const input = document.getElementById(id);
    const error = document.getElementById(`err-${id}`);

    if (input) input.classList.remove("is-invalid");
    if (error) error.textContent = "";
  });
}

function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) input.classList.add("is-invalid");
  if (error) error.textContent = message;
}

function setLoading(buttonId, textId, spinnerId, isLoading) {
  const button = document.getElementById(buttonId);
  const text = document.getElementById(textId);
  const spinner = document.getElementById(spinnerId);

  if (button) button.disabled = isLoading;
  if (text) text.style.display = isLoading ? "none" : "inline";
  if (spinner) spinner.classList.toggle("d-none", !isLoading);
}