const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET - listar proveedores
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_proveedor, nombre, contacto, telefono
      FROM proveedores
      ORDER BY nombre ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener proveedores",
      error: err.message,
    });
  }
});

// GET - obtener uno
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id_proveedor, nombre, contacto, telefono
      FROM proveedores
      WHERE id_proveedor = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el proveedor",
      error: err.message,
    });
  }
});

// POST - crear proveedor
router.post("/", async (req, res) => {
  const { nombre, contacto, telefono } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "El nombre es requerido",
    });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO proveedores (nombre, contacto, telefono)
      VALUES (?, ?, ?)
      `,
      [
        nombre.trim(),
        contacto || null,
        telefono || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Proveedor creado correctamente",
      data: {
        id_proveedor: result.insertId,
        nombre: nombre.trim(),
        contacto,
        telefono,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al crear proveedor",
      error: err.message,
    });
  }
});

// PUT - actualizar proveedor
router.put("/:id", async (req, res) => {
  const { nombre, contacto, telefono } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "El nombre es requerido",
    });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE proveedores
      SET nombre = ?, contacto = ?, telefono = ?
      WHERE id_proveedor = ?
      `,
      [
        nombre.trim(),
        contacto || null,
        telefono || null,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Proveedor actualizado correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar proveedor",
      error: err.message,
    });
  }
});

// DELETE - eliminar proveedor
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM proveedores WHERE id_proveedor = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Proveedor no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Proveedor eliminado correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar proveedor",
      error: err.message,
    });
  }
});

module.exports = router;