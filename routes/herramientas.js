const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Obtener todas las herramientas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.id_herramienta,
        h.nombre,
        h.serie,
        h.stock,
        h.id_categoria,
        c.nombre_categoria,
        h.id_estado,
        eh.nombre_estado,
        h.id_status,
        sh.nombre_status
      FROM herramientas h
      LEFT JOIN categorias c ON h.id_categoria = c.id_categoria
      LEFT JOIN estado_herramienta eh ON h.id_estado = eh.id_estado
      LEFT JOIN status_herramienta sh ON h.id_status = sh.id_status
      ORDER BY h.nombre ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener herramientas',
      error: err.message
    });
  }
});

// GET - Obtener una herramienta por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        h.id_herramienta,
        h.nombre,
        h.serie,
        h.stock,
        h.id_categoria,
        c.nombre_categoria,
        h.id_estado,
        eh.nombre_estado,
        h.id_status,
        sh.nombre_status
      FROM herramientas h
      LEFT JOIN categorias c ON h.id_categoria = c.id_categoria
      LEFT JOIN estado_herramienta eh ON h.id_estado = eh.id_estado
      LEFT JOIN status_herramienta sh ON h.id_status = sh.id_status
      WHERE h.id_herramienta = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la herramienta',
      error: err.message
    });
  }
});

// POST - Crear nueva herramienta
router.post('/', async (req, res) => {
  const { nombre, serie, stock, id_categoria, id_estado, id_status } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre de la herramienta es requerido'
    });
  }

  if (!serie || serie.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'La serie de la herramienta es requerida'
    });
  }

  if (stock === undefined || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'El stock debe ser mayor o igual a 0'
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO herramientas 
      (nombre, serie, stock, id_categoria, id_estado, id_status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        serie.trim(),
        stock,
        id_categoria,
        id_estado,
        id_status
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Herramienta creada exitosamente',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la herramienta',
      error: err.message
    });
  }
});

// PUT - Actualizar herramienta
router.put('/:id', async (req, res) => {
  const { nombre, serie, stock, id_categoria, id_estado, id_status } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre de la herramienta es requerido'
    });
  }

  if (!serie || serie.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'La serie de la herramienta es requerida'
    });
  }

  if (stock === undefined || stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'El stock debe ser mayor o igual a 0'
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE herramientas 
       SET nombre = ?, serie = ?, stock = ?, id_categoria = ?, id_estado = ?, id_status = ?
       WHERE id_herramienta = ?`,
      [
        nombre.trim(),
        serie.trim(),
        stock,
        id_categoria,
        id_estado,
        id_status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Herramienta actualizada exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la herramienta',
      error: err.message
    });
  }
});

// DELETE - Eliminar herramienta
router.delete('/:id', async (req, res) => {
  try {
    const [prestamos] = await db.query(
      'SELECT COUNT(*) AS total FROM detalle_prestamo WHERE id_herramienta = ?',
      [req.params.id]
    );

    if (prestamos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: la herramienta tiene ${prestamos[0].total} préstamo(s) asociado(s)`
      });
    }

    const [compras] = await db.query(
      'SELECT COUNT(*) AS total FROM detalle_compra WHERE id_herramienta = ?',
      [req.params.id]
    );

    if (compras[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: la herramienta tiene ${compras[0].total} compra(s) asociada(s)`
      });
    }

    const [result] = await db.query(
      'DELETE FROM herramientas WHERE id_herramienta = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Herramienta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Herramienta eliminada exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la herramienta',
      error: err.message
    });
  }
});

module.exports = router;