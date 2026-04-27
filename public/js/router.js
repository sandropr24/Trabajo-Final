function navigate(page) {
  const items = document.querySelectorAll(".nav-item");
  const title = document.getElementById("topbarTitle");

  items.forEach(item => {
    item.classList.remove("active");

    if (item.dataset.page === page) {
      item.classList.add("active");
    }
  });

  if (page === "dashboard") {
    title.textContent = "Dashboard";
    renderDashboard();
  }

  if (page === "herramientas") {
    title.textContent = "Herramientas";
    renderHerramientas();
  }
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navigate(item.dataset.page);
  });
});