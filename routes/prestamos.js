const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id_prestamo,
        u.nombres_completos AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion
      FROM prestamo p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      ORDER BY p.id_prestamo DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener préstamos',
      error: err.message
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const [prestamo] = await db.query(`
      SELECT 
        p.id_prestamo,
        u.nombres_completos AS usuario,
        p.fecha_prestamo,
        p.fecha_devolucion
      FROM prestamo p
      JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE p.id_prestamo = ?
    `, [req.params.id]);

    if (prestamo.length === 0) {
      return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
    }

    const [detalle] = await db.query(`
      SELECT 
        h.nombre,
        dp.cantidad_prestada,
        dp.cantidad_devuelta,
        dp.estado_fisico
      FROM detalle_prestamo dp
      JOIN herramientas h ON dp.id_herramienta = h.id_herramienta
      WHERE dp.id_prestamo = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...prestamo[0],
        detalle
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el préstamo',
      error: err.message
    });
  }
});


router.post('/', async (req, res) => {
  const { id_usuario, herramientas } = req.body;

  if (!id_usuario || !herramientas || herramientas.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos'
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [prestamo] = await conn.query(
      `INSERT INTO prestamo (id_usuario, fecha_prestamo, fecha_devolucion)
       VALUES (?, CURDATE(), CURDATE())`,
      [id_usuario]
    );

    const id_prestamo = prestamo.insertId;

    for (const item of herramientas) {

      const [tool] = await conn.query(
        'SELECT stock FROM herramientas WHERE id_herramienta = ?',
        [item.id_herramienta]
      );

      if (tool.length === 0) {
        throw new Error('Herramienta no existe');
      }

      if (tool[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para herramienta ID ${item.id_herramienta}`);
      }

      await conn.query(
        `INSERT INTO detalle_prestamo 
        (id_prestamo, id_herramienta, cantidad_prestada, cantidad_devuelta, estado_fisico)
        VALUES (?, ?, ?, 0, 'Buen estado')`,
        [id_prestamo, item.id_herramienta, item.cantidad]
      );

      await conn.query(
        'UPDATE herramientas SET stock = stock - ? WHERE id_herramienta = ?',
        [item.cantidad, item.id_herramienta]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Préstamo registrado correctamente',
      id: id_prestamo
    });

  } catch (err) {
    await conn.rollback();

    res.status(500).json({
      success: false,
      message: err.message
    });
  } finally {
    conn.release();
  }
});


router.put('/:id/devolver', async (req, res) => {
  const { herramientas } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const item of herramientas) {

      await conn.query(
        `UPDATE detalle_prestamo 
         SET cantidad_devuelta = ?
         WHERE id_prestamo = ? AND id_herramienta = ?`,
        [item.cantidad_devuelta, req.params.id, item.id_herramienta]
      );

      await conn.query(
        'UPDATE herramientas SET stock = stock + ? WHERE id_herramienta = ?',
        [item.cantidad_devuelta, item.id_herramienta]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: 'Devolución registrada correctamente'
    });

  } catch (err) {
    await conn.rollback();

    res.status(500).json({
      success: false,
      message: err.message
    });
  } finally {
    conn.release();
  }
});

module.exports = router;