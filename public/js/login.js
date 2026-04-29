document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contraseña = document.getElementById("contraseña").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, contraseña })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      window.location.href = "index.html";
    } else {
      document.getElementById("errorMsg").innerText = data.message;
    }

  } catch (error) {
    document.getElementById("errorMsg").innerText = "Error de conexión ";
  }
});