CREATE DATABASE prestamo_herramientas;
USE prestamo_herramientas;

-- TABLAS

CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(100) NOT NULL
);

CREATE TABLE estado_herramienta (
  id_estado INT AUTO_INCREMENT PRIMARY KEY,
  nombre_estado VARCHAR(50) NOT NULL
);

CREATE TABLE status_herramienta (
  id_status INT AUTO_INCREMENT PRIMARY KEY,
  nombre_status VARCHAR(50) NOT NULL
);

CREATE TABLE proveedores (
  id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(15)
);

CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombres_completos VARCHAR(100) NOT NULL,
  dni VARCHAR(15) NOT NULL UNIQUE,
  turno ENUM('mañana','tarde','noche') NOT NULL,
  estado ENUM('vigente','baja') DEFAULT 'vigente',
  correo VARCHAR(100) UNIQUE,
  contraseña VARCHAR(100)
);

CREATE TABLE marcas (
  id_marca INT AUTO_INCREMENT PRIMARY KEY,
  nombre_marca VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE herramientas (
  id_herramienta INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  serie VARCHAR(50) NOT NULL UNIQUE,
  stock INT DEFAULT 0 CHECK (stock >= 0),
  id_categoria INT,
  id_estado INT,
  id_status INT,
  id_marca INT,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  FOREIGN KEY (id_estado) REFERENCES estado_herramienta(id_estado),
  FOREIGN KEY (id_status) REFERENCES status_herramienta(id_status),
  FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
);

CREATE TABLE compra (
  id_compra INT AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT,
  id_usuario INT,
  fecha_compra DATE,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_compra (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT,
  id_herramienta INT,
  cantidad INT CHECK (cantidad > 0),
  precio DECIMAL(10,2) CHECK (precio >= 0),
  FOREIGN KEY (id_compra) REFERENCES compra(id_compra),
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta)
);

CREATE TABLE prestamo (
  id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  fecha_prestamo DATE,
  fecha_devolucion DATE,
  entregado_por INT,
  recibido_por INT,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (entregado_por) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (recibido_por) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_prestamo (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_prestamo INT,
  id_herramienta INT,
  cantidad_prestada INT CHECK (cantidad_prestada >= 0),
  cantidad_devuelta INT CHECK (cantidad_devuelta >= 0),
  estado_fisico VARCHAR(50),
  FOREIGN KEY (id_prestamo) REFERENCES prestamo(id_prestamo),
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta)
);

CREATE TABLE usuario_rol (
  id_usuario INT,
  id_rol INT,
  PRIMARY KEY (id_usuario, id_rol),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE
);


INSERT INTO roles (nombre_rol) VALUES 
('Administrador'),
('Almacenero'),
('Supervisor'),
('Técnico'),
('Invitado');

INSERT INTO usuarios (nombres_completos, dni, turno, estado, correo, contraseña) VALUES 
('Sandro Pachas', '60807449', 'tarde', 'vigente', 'sandroromanipr24@gmail.com', '$2b$10$vUHgl6LLrD/PVttWb.WinuI7GXE/EdM1fAxynEofcYqJo5blIj/US'),
('Maria Lopez', '87654321', 'tarde', 'vigente', 'maria@gmail.com', '$2b$10$gbXIwWfkkarGpwrV5nKDAuFQdnYYhXtRGu4nIeAVe0HJQGib./.su'),
('Carlos Ramos', '11223344', 'noche', 'vigente', 'carlos@gmail.com', '$2b$10$tDKPcJUUOhL.hg.VQuiQlOldjklQ70PFbopna/DY5OPu3UJFUcdxa'),
('Ana Torres', '55667788', 'mañana', 'baja', 'ana@gmail.com', '$2b$10$GIDDAM4BHY/sOuKnl5g3zeYXaGyAbG/7.G2xBeL81nj2jftzSfLse'),
('Luis Gomez', '99887766', 'tarde', 'vigente', 'luis@gmail.com', '$2b$10$nErx66quczdQbGKZEgnn8Oz7kjvnXNJgTTCtp0Z42ESkscfxKrlg2');


INSERT INTO usuario_rol (id_usuario, id_rol) VALUES 
(1,1),
(2,2),
(3,3),
(4,4),
(5,2);

INSERT INTO categorias (nombre_categoria) VALUES 
('Herramientas eléctricas'),
('Herramientas manuales'),
('Medición'),
('Construcción'),
('Jardinería');

INSERT INTO estado_herramienta (nombre_estado) VALUES 
('Nueva'),
('Usada'),
('Defectuosa'),
('En reparación'),
('De baja');

INSERT INTO status_herramienta (nombre_status) VALUES 
('Disponible'),
('Prestado'),
('En uso'),
('Reservado'),
('No disponible');

INSERT INTO marcas (nombre_marca) VALUES
('Bosch'),
('Makita'),
('DeWalt'),
('Milwaukee'),
('Black & Decker'),

('Stanley'),
('Truper'),
('Irwin'),
('Bahco'),
('Klein Tools');

INSERT INTO herramientas (nombre, serie, stock, id_categoria, id_estado, id_status, id_marca) VALUES 
('Taladro', 'TAL-001', 5, 1, 1, 1,2),
('Martillo', 'MAR-001', 10, 2, 2, 1,4),
('Podadora', 'POD-001', 3, 3, 1, 1,2),
('Mezcladora', 'MEZ-001', 2, 4, 2, 2,2),
('Cinta Métrica', 'CIN-001', 8, 5, 1, 1,8);

INSERT INTO proveedores (nombre, contacto, telefono) VALUES 
('Ferreteria Central', 'Carlos Ruiz', '999888777'),
('Tools Perú', 'Ana Diaz', '988776655'),
('Industrial SAC', 'Luis Peña', '977665544'),
('MegaHerramientas', 'Rosa Soto', '966554433'),
('Constructora Proveedor', 'Pedro Vega', '955443322');

INSERT INTO compra (id_proveedor, id_usuario, fecha_compra) VALUES 
(1,1,'2026-04-20'),
(2,2,'2026-04-21'),
(3,1,'2026-04-22'),
(4,3,'2026-04-23'),
(5,2,'2026-04-24');

INSERT INTO detalle_compra (id_compra, id_herramienta, cantidad, precio) VALUES 
(1,1,5,150.00),
(2,2,10,20.00),
(3,3,3,300.00),
(4,4,2,1000.00),
(5,5,8,25.00);

INSERT INTO prestamo (id_usuario, fecha_prestamo, fecha_devolucion, entregado_por, recibido_por) VALUES 
(2,'2026-04-25','2026-04-25',1,1),
(3,'2026-04-25','2026-04-25',1,2),
(5,'2026-04-26','2026-04-26',2,1),
(1,'2026-04-26','2026-04-26',2,2),
(2,'2026-04-26','2026-04-26',1,2);

INSERT INTO detalle_prestamo (id_prestamo, id_herramienta, cantidad_prestada, cantidad_devuelta, estado_fisico) VALUES 
(1,1,1,1,'Buen estado'),
(2,2,2,2,'Buen estado'),
(3,3,1,1,'Usado'),
(4,4,1,1,'Buen estado'),
(5,5,3,3,'Buen estado');


SELECT * FROM herramientas;




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
LEFT JOIN roles r ON ur.id_rol = r.id_rol;




