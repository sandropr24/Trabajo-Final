# ToolControl - Sistema de Gestión de Herramientas

## Descripción

ToolControl es una aplicación web desarrollada para la gestión integral de herramientas, permitiendo controlar préstamos, devoluciones, inventario y usuarios dentro de un entorno organizacional.

El sistema digitaliza procesos manuales, mejora la trazabilidad de los recursos, reduce pérdidas y optimiza la administración de herramientas en talleres o almacenes.

Este proyecto ha sido desarrollado como trabajo final académico, implementando una arquitectura modular que separa frontend, backend y base de datos.

---

## Tecnologías utilizadas

- Node.js
- Express
- MySQL
- HTML, CSS y JavaScript

---

## Repositorio

Código fuente disponible en:

https://github.com/sandropr24/Trabajo-Final.git

---

## Autores

- Yuliana Milagros Solari Oporto
- Sandro Romani Pachas

Proyecto desarrollado de forma colaborativa mediante control de versiones.

---

## Requisitos

Antes de ejecutar el sistema, asegúrese de contar con:

- Node.js
- XAMPP
- MySQL
- Navegador web 

---

## Instalación

### 1. Clonar el repositorio

git clone https://github.com/sandropr24/Trabajo-Final.git
cd Trabajo-Final

### 2. Instalar dependencias
npm install
### 3. Configuración de variables de entorno

Crear un archivo .env en la raíz del proyecto:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=prestamo_herramientas
DB_PORT=3306
 ### 4. Configuración de la base de datos

Ejecutar en MySQL:

CREATE DATABASE prestamo_herramientas;

Importar el archivo:

prestamo_db.sql
 ### 5. Configuración de conexión (db.js)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 50,
  timezone: "-05:00",
});
### Ejecución del sistema
node server.js
### Acceso al sistema
Login:
http://localhost:3000/
Dashboard:
http://localhost:3000/index.html
API:
http://localhost:3000/api
### Funcionalidades
Autenticación de usuarios
Gestión de usuarios
Gestión de herramientas
Control de préstamos y devoluciones
Dashboard con estadísticas
Navegación tipo SPA
API REST
Conexión a base de datos mediante pool
### Flujo de uso
El usuario accede al sistema mediante login.
Ingresa sus credenciales.
El sistema valida la información.
Se habilita el acceso al dashboard.
El usuario gestiona herramientas y préstamos.
Consideraciones técnicas
Implementar autenticación con JWT
Validar datos en backend
Aplicar restricciones en base de datos
Organizar el proyecto bajo patrón MVC

### Buenas prácticas
Uso de variables de entorno
Código modular
Separación de responsabilidades
Control de versiones con GitHub
Uso de pool de conexiones
### Estado del proyecto:

En desarrollo avanzado, con funcionalidades principales implementadas y en mejora continua.
