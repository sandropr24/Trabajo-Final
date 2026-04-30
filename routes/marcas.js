const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_marca, nombre_marca
      FROM marcas
      ORDER BY nombre_marca ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener marcas",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id_marca, nombre_marca
      FROM marcas
      WHERE id_marca = ?
    `,
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la marca",
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "El nombre es requerido",
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO marcas (nombre_marca) VALUES (?)",
      [nombre.trim()],
    );

    res.status(201).json({
      success: true,
      message: "Marca creada correctamente",
      data: {
        id_marca: result.insertId,
        nombre_marca: nombre.trim(),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al crear la marca",
      error: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "El nombre es requerido",
    });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE marcas
      SET nombre_marca = ?
      WHERE id_marca = ?
    `,
      [nombre.trim(), req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Marca actualizada correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar la marca",
      error: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM marcas WHERE id_marca = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Marca no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Marca eliminada correctamente",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar la marca",
      error: err.message,
    });
  }
});

module.exports = router;
