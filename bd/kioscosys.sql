-- Base de datos actualizada con nuevas tablas
CREATE DATABASE IF NOT EXISTS kioscosys;
USE kioscosys;

-- Tabla de usuarios (para múltiples usuarios)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100),
    rol ENUM('admin', 'vendedor') DEFAULT 'vendedor',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos con categorías
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'General',
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas (facturación con IVA)
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de detalle de ventas
CREATE TABLE detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT,
    producto_id INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (nombre_usuario, contrasenia, nombre_completo, rol) 
VALUES ('admin', 'admin123', 'Administrador', 'admin');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo) VALUES
('Coca Cola 2L', 'Bebidas', 250.00, 50, 10),
('Papas Fritas', 'Snacks', 180.00, 30, 5),
('Alfajor', 'Golosinas', 120.00, 80, 15),
('Agua Mineral 1L', 'Bebidas', 150.00, 40, 10),
('Galletitas', 'Comestibles', 90.00, 60, 10);