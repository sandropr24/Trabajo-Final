const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/login", async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son obligatorios",
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id_usuario,
        u.nombres_completos,
        u.correo,
        u.contraseña,
        r.nombre_rol
      FROM usuarios u
      INNER JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      INNER JOIN roles r ON ur.id_rol = r.id_rol
      WHERE u.correo = ?
      `,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const usuario = rows[0];

    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta",
      });
    }

    res.json({
      success: true,
      message: "Login exitoso",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombres_completos: usuario.nombres_completos,
        correo: usuario.correo,
        rol: usuario.nombre_rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
});

module.exports = router;