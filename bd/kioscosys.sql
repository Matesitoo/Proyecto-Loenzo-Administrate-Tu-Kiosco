CREATE DATABASE kioscosys;

USE kioscosys;

CREATE TABLE productos(

    id INT
    AUTO_INCREMENT
    PRIMARY KEY,

    nombre VARCHAR(100)
    NOT NULL,

    precio DECIMAL(10,2)
    NOT NULL,

    stock INT
    NOT NULL

);

CREATE TABLE ventas(

    id INT
    AUTO_INCREMENT
    PRIMARY KEY,

    fecha DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    total DECIMAL(10,2)
    NOT NULL

);

CREATE TABLE detalle_ventas(

    id INT
    AUTO_INCREMENT
    PRIMARY KEY,

    venta_id INT,

    producto_id INT,

    cantidad INT,

    subtotal DECIMAL(10,2),

    FOREIGN KEY
    (venta_id)

    REFERENCES ventas(id),

    FOREIGN KEY
    (producto_id)

    REFERENCES productos(id)

);