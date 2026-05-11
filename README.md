# ToolControl - Sistema de Gestión de Herramientas
 
## Descripción
 
ToolControl es una aplicación web desarrollada para la gestión integral de herramientas, permitiendo administrar inventario, préstamos, devoluciones y usuarios dentro de un entorno organizacional.
 
El sistema busca digitalizar procesos manuales, mejorar la trazabilidad de los recursos, reducir pérdidas y optimizar la administración de herramientas en talleres o almacenes.
 
Este proyecto fue desarrollado como trabajo final académico, aplicando una arquitectura modular basada en frontend, backend y base de datos.
 
---
 
## Tecnologías utilizadas
 
- Node.js
- Express.js
- MySQL
- HTML5
- CSS3
- JavaScript
- Bootstrap Icons
- SweetAlert2
- Git y GitHub
---
 
## Arquitectura del proyecto
 
El sistema está dividido en:
 
- Frontend modular SPA
- Backend REST API
- Base de datos MySQL
- Gestión de rutas y módulos independientes
- Pool de conexiones para optimización de consultas
---
 
## Repositorio
 
Código fuente disponible en:
 
[Repositorio ToolControl](https://github.com/sandropr24/Trabajo-Final)
 
---
 
## Autores
 
- Sandro Romani Pachas
- Yuliana Milagros Solari Oporto
Proyecto desarrollado de manera colaborativa utilizando control de versiones con Git y GitHub.
 
---
 
## Requisitos
 
Antes de ejecutar el sistema, asegúrese de contar con:
 
- Node.js
- XAMPP o MySQL Server
- MySQL
- Git
- Navegador web moderno
---
 
## Instalación
 
### 1. Clonar el repositorio
 
```bash
git clone https://github.com/sandropr24/Trabajo-Final.git
cd Trabajo-Final
```
 
### 2. Instalar dependencias
 
```bash
npm install
```
 
### 3. Configurar variables de entorno
 
Crear un archivo `.env` en la raíz del proyecto:
 
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=prestamo_herramientas
DB_PORT=3306
PORT=3000
```
 
### 4. Crear la base de datos
 
Ejecutar en MySQL:
 
```sql
CREATE DATABASE prestamo_herramientas;
```
 
Luego importar el archivo:
 
```
prestamo_db.sql
```
 
### 5. Configurar conexión MySQL
 
Archivo `config/db.js`:
 
```js
const mysql = require("mysql2/promise");
 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 50,
  timezone: "-05:00",
});
 
module.exports = pool;
```
 
---
 
## Ejecución del sistema
 
### Iniciar servidor
 
```bash
node server.js
```
 
O en desarrollo:
 
```bash
nodemon server.js
```
 
### Acceso al sistema
 
| | URL |
|---|---|
| Login | http://localhost:3000/ |
| Dashboard | http://localhost:3000/index.html |
| API REST | http://localhost:3000/api |
 
---
 
## Funcionalidades principales
 
- Autenticación de usuarios
- Gestión de usuarios
- Gestión de herramientas
- Gestión de marcas
- Gestión de proveedores
- Gestión de préstamos
- Gestión de compras
- Dashboard con estadísticas
- Navegación SPA
- API REST modular
- Validaciones frontend y backend
- Control de roles
- Gestión de estados
- Interfaz moderna y responsive
- Pool de conexiones MySQL
---
 
## Flujo general del sistema
 
1. El usuario accede al login.
2. Ingresa sus credenciales.
3. El sistema valida la información.
4. Se habilita el acceso al dashboard.
5. El usuario administra herramientas y préstamos.
6. El sistema registra operaciones en la base de datos.
---
 
## Estructura del proyecto
 
```
Trabajo-Final/
│
├── public/
│   ├── js/
│   ├── view/
│   ├── css/
│
├── routes/
├── config/
├── database/
├── server.js
├── package.json
└── .env
```
 
---
 
## Consideraciones técnicas
 
- Arquitectura modular
- Patrón MVC parcial
- API REST con Express
- Validaciones en frontend y backend
- Uso de consultas parametrizadas
- Protección contra inyección SQL
- Contraseñas encriptadas con bcrypt
- Variables de entorno para configuración
- Manejo de errores HTTP
- Organización por módulos independiente
---
 
## Autores
 
| Nombre | GitHub |
|--------|--------|
| Sandro Romani Pachas | [@sandropr24](https://github.com/sandropr24) |
| Yuliana Milagros Solari Oporto | [@yulisolarioporto-cloud](https://github.com/yulisolarioporto-cloud) |
 
Proyecto desarrollado colaborativamente con control de versiones Git y GitHub.
 
---
 
## Estado del proyecto
 
Proyecto en desarrollo avanzado con funcionalidades principales implementadas y mejoras continuas enfocadas en:
 
- Optimización del sistema
- Mejoras visuales
- Seguridad
- Validaciones
- Escalabilidad
- Experiencia de usuario
 
---
 
## Licencia
 
Proyecto desarrollado con fines **académicos y educativos**