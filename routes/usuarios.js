const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id_usuario,
        u.nombres_completos,
        u.dni,
        u.turno,
        u.estado,
        u.correo,
        r.nombre_rol
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN roles r ON ur.id_rol = r.id_rol
      ORDER BY u.nombres_completos ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: err.message
    });
  }
});

// GET - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id_usuario,
        u.nombres_completos,
        u.dni,
        u.turno,
        u.estado,
        u.correo,
        r.id_rol,
        r.nombre_rol
      FROM usuarios u
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN roles r ON ur.id_rol = r.id_rol
      WHERE u.id_usuario = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: err.message
    });
  }
});

// POST - Crear usuario
router.post('/', async (req, res) => {
  const { nombres_completos, dni, turno, estado, correo, contraseña, id_rol } = req.body;

  if (!nombres_completos || nombres_completos.trim() === '') {
    return res.status(400).json({ success: false, message: 'Los nombres completos son requeridos' });
  }

  if (!dni || dni.trim() === '') {
    return res.status(400).json({ success: false, message: 'El DNI es requerido' });
  }

  if (!turno || !['mañana', 'tarde', 'noche'].includes(turno)) {
    return res.status(400).json({ success: false, message: 'El turno debe ser mañana, tarde o noche' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO usuarios 
      (nombres_completos, dni, turno, estado, correo, contraseña)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombres_completos.trim(),
        dni.trim(),
        turno,
        estado || 'vigente',
        correo || null,
        contraseña || null
      ]
    );

    if (id_rol) {
      await db.query(
        'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
        [result.insertId, id_rol]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
      error: err.message
    });
  }
});

// PUT - Actualizar usuario
router.put('/:id', async (req, res) => {
  const { nombres_completos, dni, turno, estado, correo, contraseña, id_rol } = req.body;

  if (!nombres_completos || nombres_completos.trim() === '') {
    return res.status(400).json({ success: false, message: 'Los nombres completos son requeridos' });
  }

  if (!dni || dni.trim() === '') {
    return res.status(400).json({ success: false, message: 'El DNI es requerido' });
  }

  if (!turno || !['mañana', 'tarde', 'noche'].includes(turno)) {
    return res.status(400).json({ success: false, message: 'El turno debe ser mañana, tarde o noche' });
  }

  try {
    const [result] = await db.query(
      `UPDATE usuarios 
       SET nombres_completos = ?, dni = ?, turno = ?, estado = ?, correo = ?, contraseña = ?
       WHERE id_usuario = ?`,
      [
        nombres_completos.trim(),
        dni.trim(),
        turno,
        estado || 'vigente',
        correo || null,
        contraseña || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (id_rol) {
      await db.query('DELETE FROM usuario_rol WHERE id_usuario = ?', [req.params.id]);
      await db.query(
        'INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)',
        [req.params.id, id_rol]
      );
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: err.message
    });
  }
});

// DELETE - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const [prestamos] = await db.query(
      'SELECT COUNT(*) AS total FROM prestamo WHERE id_usuario = ? OR entregado_por = ? OR recibido_por = ?',
      [req.params.id, req.params.id, req.params.id]
    );

    if (prestamos[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: el usuario tiene ${prestamos[0].total} préstamo(s) asociado(s)`
      });
    }

    const [compras] = await db.query(
      'SELECT COUNT(*) AS total FROM compra WHERE id_usuario = ?',
      [req.params.id]
    );

    if (compras[0].total > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: el usuario tiene ${compras[0].total} compra(s) asociada(s)`
      });
    }

    await db.query('DELETE FROM usuario_rol WHERE id_usuario = ?', [req.params.id]);

    const [result] = await db.query(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario',
      error: err.message
    });
  }
});

module.exports = router;