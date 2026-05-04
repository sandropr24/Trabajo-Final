require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/herramientas', require('./routes/herramientas'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/marcas', require('./routes/marcas'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/compras', require('./routes/compras'));

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API del sistema de préstamo de herramientas funcionando correctamente'
  });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Login:             http://localhost:${PORT}`);
  console.log(`Dashboard:         http://localhost:${PORT}/index.html`);
  console.log(`API Auth:          http://localhost:${PORT}/api/auth`);
  console.log(`API Usuarios:      http://localhost:${PORT}/api/usuarios`);
  console.log(`API Herramientas:  http://localhost:${PORT}/api/herramientas`);
  console.log(`API Préstamos:     http://localhost:${PORT}/api/prestamos`);
  console.log(`API Marcas:        http://localhost:${PORT}/api/marcas`);
  console.log(`API Proveedores:   http://localhost:${PORT}/api/proveedores`);
  console.log(`API Compras:       http://localhost:${PORT}/api/compras\n`);
   
});

module.exports = app;