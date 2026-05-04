const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET - listar compras
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id_compra,
        c.fecha_compra,
        p.nombre AS proveedor,
        u.nombres_completos AS usuario,
        COALESCE(SUM(dc.cantidad * dc.precio), 0) AS total
      FROM compra c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN detalle_compra dc ON c.id_compra = dc.id_compra
      GROUP BY c.id_compra
      ORDER BY c.id_compra DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener compras",
      error: err.message,
    });
  }
});

// GET - detalle de compra
router.get("/:id", async (req, res) => {
  try {
    const [compra] = await db.query(
      `
      SELECT 
        c.id_compra,
        c.id_proveedor,
        c.id_usuario,
        c.fecha_compra,
        p.nombre AS proveedor,
        u.nombres_completos AS usuario
      FROM compra c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      WHERE c.id_compra = ?
      `,
      [req.params.id]
    );

    if (compra.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Compra no encontrada",
      });
    }

    const [detalle] = await db.query(
      `
      SELECT 
        dc.id_detalle,
        dc.id_herramienta,
        h.nombre,
        dc.cantidad,
        dc.precio,
        (dc.cantidad * dc.precio) AS subtotal
      FROM detalle_compra dc
      JOIN herramientas h ON dc.id_herramienta = h.id_herramienta
      WHERE dc.id_compra = ?
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...compra[0],
        detalle,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener compra",
      error: err.message,
    });
  }
});

// POST - registrar compra y aumentar stock
router.post("/", async (req, res) => {
  const { id_proveedor, id_usuario, fecha_compra, herramientas } = req.body;

  if (!id_proveedor) {
    return res.status(400).json({
      success: false,
      message: "Debes seleccionar un proveedor",
    });
  }

  if (!id_usuario) {
    return res.status(400).json({
      success: false,
      message: "Debes seleccionar un usuario responsable",
    });
  }

  if (!fecha_compra) {
    return res.status(400).json({
      success: false,
      message: "Debes seleccionar una fecha de compra",
    });
  }

  if (
    !herramientas ||
    !Array.isArray(herramientas) ||
    herramientas.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Debes agregar al menos una herramienta",
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [compra] = await conn.query(
      `
      INSERT INTO compra (id_proveedor, id_usuario, fecha_compra)
      VALUES (?, ?, ?)
      `,
      [id_proveedor, id_usuario, fecha_compra]
    );

    const id_compra = compra.insertId;

    for (const item of herramientas) {
      const id_herramienta = Number(item.id_herramienta);
      const cantidad = Number(item.cantidad);
      const precio = Number(item.precio);

      if (!id_herramienta || !cantidad || cantidad <= 0) {
        throw new Error("La herramienta y la cantidad son obligatorias");
      }

      if (precio < 0 || Number.isNaN(precio)) {
        throw new Error("El precio no puede ser negativo");
      }

      const [herramienta] = await conn.query(
        `
        SELECT id_herramienta
        FROM herramientas
        WHERE id_herramienta = ?
        FOR UPDATE
        `,
        [id_herramienta]
      );

      if (herramienta.length === 0) {
        throw new Error("Herramienta no encontrada");
      }

      await conn.query(
        `
        INSERT INTO detalle_compra
        (id_compra, id_herramienta, cantidad, precio)
        VALUES (?, ?, ?, ?)
        `,
        [id_compra, id_herramienta, cantidad, precio]
      );

      await conn.query(
        `
        UPDATE herramientas
        SET stock = stock + ?
        WHERE id_herramienta = ?
        `,
        [cantidad, id_herramienta]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Compra registrada correctamente",
      id: id_compra,
    });
  } catch (err) {
    await conn.rollback();

    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    conn.release();
  }
});

module.exports = router;