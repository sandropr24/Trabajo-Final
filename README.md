# ToolControl - Sistema de Gestión de Herramientas

## Descripción

ToolControl es una aplicación web desarrollada para la gestión de herramientas, control de préstamos y administración de usuarios. El sistema permite registrar herramientas, gestionar su disponibilidad, controlar préstamos y visualizar información mediante un panel administrativo.
El proyecto ha sido desarrollado como trabajo final académico, siguiendo una estructura modular que separa frontend, backend y base de datos.

---

## Repositorio

Código fuente disponible en:

GitHub
https://github.com/sandropr24/Trabajo-Final.git

---

## Autores

* Sandro Romani Pachas
* Yuliana Solari Oporto

Trabajo desarrollado de forma colaborativa.

---

## Requisitos

* Node.js
* xampp
* MySQL 
* Navegador web 

---

## Instalación
## (Pasos para poder crear el repositorio sin error de credenciales)

Mofidicar el db.js 
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

Modificar el .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=prestamo_herramientas
DB_PORT=3306
### Backend


### 1. Clonar el repositorio

```bash
git clone https://github.com/sandropr24/Trabajo-Final.git
cd Trabajo-Final
```

---

### 2. Instalar dependencias

```bash
npm install
```

---

### 3. Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=prestamo_herramientas
DB_PORT=3306
```

### 4. Configuración de la base de datos

1. Crear la base de datos:

```sql
CREATE DATABASE prestamo_herramientas;
```

2. Importar el archivo `prestamo_db.sql` en el gestor de base de datos.

---

## Ejecución del sistema

```bash
node server.js
```

---

## Acceso al sistema

* Login:
  http://localhost:3000/

* Dashboard:
  http://localhost:3000/index.html

* API base:
  http://localhost:3000/api

---

## Funcionalidades actuales

* Autenticación básica de usuarios
* Interfaz de login
* Dashboard con navegación dinámica (SPA)
* Visualización de herramientas
* API REST estructurada
* Conexión a base de datos mediante pool

---

## Flujo de uso

1. El usuario accede a la página de inicio de sesión
2. Ingresa correo y contraseña
3. El sistema valida las credenciales
4. Se permite el acceso al panel principal
5. El usuario navega entre módulos disponibles

---

## Consideraciones técnicas

* Se recomienda implementar autenticación con JWT
* Validar datos en backend para evitar errores y vulnerabilidades
* Ajustar restricciones (constraints) en la base de datos

---

## Mejoras pendientes

* Protección de rutas privadas
* CRUD completo de Usuarios
* Manejo de errores estructurado

---

## Buenas prácticas

* Separar lógica en controladores
* Usar middlewares para autenticación
* Mantener código modular
* Utilizar variables de entorno
* Documentar el código

---

## Estado del proyecto

Proyecto en desarrollo con funcionalidades base implementadas.

