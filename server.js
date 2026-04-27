require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Página inicial: LOGIN
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/herramientas', require('./routes/herramientas'));
app.use('/api/prestamos', require('./routes/prestamos'));

// Ruta de prueba API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API del sistema de préstamo de herramientas funcionando correctamente'
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Login:             http://localhost:${PORT}`);
  console.log(`Dashboard:         http://localhost:${PORT}/index.html`);
  console.log(`API Auth:          http://localhost:${PORT}/api/auth`);
  console.log(`API Usuarios:      http://localhost:${PORT}/api/usuarios`);
  console.log(`API Herramientas:  http://localhost:${PORT}/api/herramientas`);
  console.log(`API Préstamos:     http://localhost:${PORT}/api/prestamos\n`);
});

module.exports = app;