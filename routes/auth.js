const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son obligatorios"
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const usuario = rows[0];

    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({
        success: false,
        message: "Contraseña incorrecta"
      });
    }

    res.json({
      success: true,
      message: "Login exitoso",
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombres_completos,
        correo: usuario.correo
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
});

module.exports = router;