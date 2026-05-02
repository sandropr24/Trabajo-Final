const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET - Obtener todos los préstamos
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id_prestamo,
        u.nombres_completos AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion,
        ue.nombres_completos AS entregado_por,
        ur.nombres_completos AS recibido_por
      FROM prestamo p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN usuarios ue ON p.entregado_por = ue.id_usuario
      LEFT JOIN usuarios ur ON p.recibido_por = ur.id_usuario
      ORDER BY p.id_prestamo DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener préstamos",
      error: err.message,
    });
  }
});

// GET - Obtener préstamo por ID
router.get("/:id", async (req, res) => {
  try {
    const [prestamo] = await db.query(
      `
      SELECT 
        p.id_prestamo,
        p.id_usuario,
        u.nombres_completos AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion,
        p.entregado_por,
        ue.nombres_completos AS nombre_entregado_por,
        p.recibido_por,
        ur.nombres_completos AS nombre_recibido_por
      FROM prestamo p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      LEFT JOIN usuarios ue ON p.entregado_por = ue.id_usuario
      LEFT JOIN usuarios ur ON p.recibido_por = ur.id_usuario
      WHERE p.id_prestamo = ?
      `,
      [req.params.id],
    );

    if (prestamo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Préstamo no encontrado",
      });
    }

    const [detalle] = await db.query(
      `
      SELECT 
        dp.id_detalle,
        dp.id_herramienta,
        h.nombre,
        dp.cantidad_prestada,
        dp.cantidad_devuelta,
        dp.estado_fisico
      FROM detalle_prestamo dp
      JOIN herramientas h ON dp.id_herramienta = h.id_herramienta
      WHERE dp.id_prestamo = ?
      `,
      [req.params.id],
    );

    res.json({
      success: true,
      data: {
        ...prestamo[0],
        detalle,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el préstamo",
      error: err.message,
    });
  }
});

// POST - Registrar préstamo
router.post("/", async (req, res) => {
  const {
    id_usuario,
    fecha_devolucion,
    entregado_por,
    recibido_por,
    herramientas,
  } = req.body;

  if (!id_usuario) {
    return res.status(400).json({
      success: false,
      message: "Debes seleccionar un usuario",
    });
  }

  if (!fecha_devolucion) {
    return res.status(400).json({
      success: false,
      message: "Debes seleccionar una fecha de devolución",
    });
  }

  if (
    !herramientas ||
    !Array.isArray(herramientas) ||
    herramientas.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Debes seleccionar al menos una herramienta",
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [prestamo] = await conn.query(
      `
      INSERT INTO prestamo 
      (id_usuario, fecha_prestamo, fecha_devolucion, entregado_por, recibido_por)
      VALUES (?, CURDATE(), ?, ?, ?)
      `,
      [
        id_usuario,
        fecha_devolucion,
        entregado_por || null,
        recibido_por || null,
      ],
    );

    const id_prestamo = prestamo.insertId;

    for (const item of herramientas) {
      const id_herramienta = Number(item.id_herramienta);
      const cantidad = Number(item.cantidad);

      if (!id_herramienta || !cantidad || cantidad <= 0) {
        throw new Error("La herramienta y la cantidad son obligatorias");
      }

      const [tool] = await conn.query(
        `
        SELECT id_herramienta, nombre, stock 
        FROM herramientas 
        WHERE id_herramienta = ?
        FOR UPDATE
        `,
        [id_herramienta],
      );

      if (tool.length === 0) {
        throw new Error("Herramienta no existe");
      }

      if (tool[0].stock < cantidad) {
        throw new Error(
          `Stock insuficiente para "${tool[0].nombre}". Disponible: ${tool[0].stock}`,
        );
      }

      await conn.query(
        `
        INSERT INTO detalle_prestamo 
        (id_prestamo, id_herramienta, cantidad_prestada, cantidad_devuelta, estado_fisico)
        VALUES (?, ?, ?, 0, ?)
        `,
        [
          id_prestamo,
          id_herramienta,
          cantidad,
          item.estado_fisico || "Buen estado",
        ],
      );

      await conn.query(
        `
        UPDATE herramientas 
        SET stock = stock - ? 
        WHERE id_herramienta = ?
        `,
        [cantidad, id_herramienta],
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Préstamo registrado correctamente",
      id: id_prestamo,
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

// PUT - Registrar devolución
router.put("/:id/devolver", async (req, res) => {
  const { recibido_por, herramientas } = req.body;

  if (
    !herramientas ||
    !Array.isArray(herramientas) ||
    herramientas.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Debes enviar las herramientas a devolver",
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [prestamoExiste] = await conn.query(
      "SELECT id_prestamo FROM prestamo WHERE id_prestamo = ?",
      [req.params.id],
    );

    if (prestamoExiste.length === 0) {
      throw new Error("Préstamo no encontrado");
    }

    for (const item of herramientas) {
      const id_herramienta = Number(item.id_herramienta);
      const cantidadNuevaDevuelta = Number(item.cantidad_devuelta);

      if (!id_herramienta || cantidadNuevaDevuelta < 0) {
        throw new Error("Datos de devolución inválidos");
      }

      const [detalle] = await conn.query(
        `
        SELECT cantidad_prestada, cantidad_devuelta
        FROM detalle_prestamo
        WHERE id_prestamo = ? AND id_herramienta = ?
        FOR UPDATE
        `,
        [req.params.id, id_herramienta],
      );

      if (detalle.length === 0) {
        throw new Error("La herramienta no pertenece a este préstamo");
      }

      const cantidadPrestada = Number(detalle[0].cantidad_prestada);
      const cantidadDevueltaActual = Number(detalle[0].cantidad_devuelta);

      if (cantidadNuevaDevuelta > cantidadPrestada) {
        throw new Error("No puedes devolver más de lo prestado");
      }

      const diferencia = cantidadNuevaDevuelta - cantidadDevueltaActual;

      if (diferencia < 0) {
        throw new Error("No puedes reducir una devolución ya registrada");
      }

      await conn.query(
        `
        UPDATE detalle_prestamo 
        SET cantidad_devuelta = ?
        WHERE id_prestamo = ? AND id_herramienta = ?
        `,
        [cantidadNuevaDevuelta, req.params.id, id_herramienta],
      );

      if (diferencia > 0) {
        await conn.query(
          `
          UPDATE herramientas 
          SET stock = stock + ? 
          WHERE id_herramienta = ?
          `,
          [diferencia, id_herramienta],
        );
      }
    }

    if (recibido_por) {
      await conn.query(
        `
        UPDATE prestamo
        SET recibido_por = ?
        WHERE id_prestamo = ?
        `,
        [recibido_por, req.params.id],
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Devolución registrada correctamente",
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

// DELETE - Eliminar préstamo
router.delete("/:id", async (req, res) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [detalle] = await conn.query(
      `
      SELECT id_herramienta, cantidad_prestada, cantidad_devuelta
      FROM detalle_prestamo
      WHERE id_prestamo = ?
      FOR UPDATE
      `,
      [req.params.id],
    );

    const [prestamo] = await conn.query(
      "SELECT id_prestamo FROM prestamo WHERE id_prestamo = ?",
      [req.params.id],
    );

    if (prestamo.length === 0) {
      throw new Error("Préstamo no encontrado");
    }

    for (const item of detalle) {
      const pendiente =
        Number(item.cantidad_prestada) - Number(item.cantidad_devuelta);

      if (pendiente > 0) {
        await conn.query(
          `
          UPDATE herramientas
          SET stock = stock + ?
          WHERE id_herramienta = ?
          `,
          [pendiente, item.id_herramienta],
        );
      }
    }

    await conn.query("DELETE FROM detalle_prestamo WHERE id_prestamo = ?", [
      req.params.id,
    ]);

    await conn.query("DELETE FROM prestamo WHERE id_prestamo = ?", [
      req.params.id,
    ]);

    await conn.commit();

    res.json({
      success: true,
      message: "Préstamo eliminado correctamente",
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
