# Sistema de Gestión de Órdenes de Pago

## 1. Descripción del Proyecto

Este proyecto implementa un sistema para la gestión de **Órdenes de Pago**, permitiendo a los usuarios crear órdenes, adjuntar facturas, aprobar o rechazar solicitudes y notificar automáticamente a un sistema externo cuando una orden es aprobada.

El objetivo de este sistema es demostrar la implementación de una arquitectura backend moderna con **Spring Boot**, integraciones externas, manejo de archivos en almacenamiento tipo **S3 / Blob Storage**, autenticación basada en **JWT** y control de acceso basado en **roles (RBAC)**.

---

# 2. Arquitectura del Sistema

El sistema sigue una arquitectura **cliente-servidor** dividida en los siguientes componentes:

### Frontend

Responsable de la interacción con el usuario.

Funciones principales:

* Login de usuario
* Dashboard dinámico según rol
* Crear órdenes
* Listar órdenes con filtros
* Ver detalle de orden
* Subir factura
* Aprobar o rechazar órdenes (solo ADMIN)

Tecnología usada:

* Angular

Responsabilidades:
* Mostrar pantallas
* Manejar Formularios
* Enviar Peticiones al Backend
* Mostrar Respuestas a Peticiones

---

### Backend

API REST desarrollada con Spring Boot que gestiona la lógica de negocio.

Responsabilidades:

* Autenticación y autorización
* Gestión de órdenes
* Manejo de estados
* Integración con almacenamiento de archivos
* Integración con sistema externo

---

### Base de Datos

Base de datos relacional encargada de almacenar la información del sistema.

* PostgreSQL

---

### Almacenamiento de Archivos

Sistema de almacenamiento tipo:

* Amazon S3
* Azure Blob Storage
* MinIO

Se utiliza para almacenar las **facturas (PDF o imágenes)** asociadas a cada orden. En este caso PNG, JPG, JPEG y PDF.

---

### Integración Externa

Cuando una orden cambia al estado **APROBADO**, el sistema envía una notificación mediante una llamada HTTP POST a un servicio externo de prueba.

Endpoint utilizado:

https://localhost8080/custom-response


---

# 3. Estructura del Proyecto

La estructura del backend sigue una arquitectura por capas para separar responsabilidades.

backend/src/main/java/com/example/backend/config/Web.Config: Se encarga de configurar recursos estáticos personalizados en la aplicación. Específicamente permite que los archivos almacenados en la carpeta "uploads" del backend puedan ser accedidos mediante una URL pública.

controllers/AuthController.java:
se encarga de gestionar la autenticación de los usuarios dentro del sistema. Su principal función es validar las credenciales enviadas desde el frontend y generar un token JWT cuando el usuario se autentica correctamente.

controllers/OrderController.java: Se encargado de gestionar todas las operaciones relacionadas con las órdenes dentro del sistema. Permite crear órdenes,
consultar órdenes existentes, actualizar su estado y consultar el historial de cambios de estado asociados a cada orden.

controllers/FileController.java: se encarga de gestionar el acceso y la descarga de archivos almacenados en el servidor, específicamente aquellos guardados en la
carpeta "uploads" del backend.

models/Order.java: Representa la entidad de "Orden" (tabla orders) dentro del sistema de gestión de pagos. Su función es modelar la información principal de una orden, incluyendo su título, descripción, monto, estado, comprobante (invoice), así como los datos relacionados con su creación y aprobación.

models/OrderStatusLog.java: Representa el historial de cambios de estado de una orden que viene de la tabla orders de mi posgresql. Su función es registrar cada vez que una orden cambia de estado, almacenando el estado anterior, el nuevo estado, la fecha del cambio y el usuario que realizó la modificación.

models/User.java: Representa la entidad de usuario ("user") dentro del sistema. Su función es almacenar la información básica necesaria para la autenticación y
autorización de los usuarios, como el correo electrónico, la contraseña y el rol que determina sus permisos dentro de la aplicación.

repositories/OrderRepository.java: Se encarga de gestionar las operaciones de acceso a datos relacionadas con la entidad Order. Permitiendo peticiones como guardar, actualizar y consultar órdenes almacenadas en la base de datos.

repositories/OrderStatusLogRepository.java: Se encarga de gestionar el acceso a los datos relacionados con el historial de cambios de estado de las órdenes. Permite consultar, guardar y administrar los registros almacenados en la tabla "order_status_log".

repositories/UserRepository.java: Se encarga de gestionar el acceso a los datos de los usuarios almacenados en la base de datos (user). Permite realizar operaciones de persistencia como consultar, guardar, actualizar registros de la entidad user.

security/JwtFilter.java: Actúa como un filtro de seguridad encargado de interceptar todas las solicitudes HTTP entrantes al backend para validar el token
JWT enviado por el cliente. Su función principal es verificar que el token sea válido antes de permitir el acceso a los endpoints protegidos. 

security/JwtUtil.java: Se encarga de generar, validar y extraer información de los tokens JWT utilizados para la autenticación de los usuarios dentro del sistema.

security/SecurityConfig.java: Aqui se configura la seguridad del backend, definiendo qué endpoints son públicos, cuáles requieren autenticación y cómo se aplica el filtro de JWT en cada solicitud HTTP.

---

# 4. Modelo de Base de Datos

El sistema utiliza las siguientes tablas principales.

---
##Base de Datos payment-orders
Sentencia:
```
CREATE DATABASE payment_orders;
```

## Tabla "user" 
Sentencia:
```
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(250) NOT NULL,
    rol VARCHAR(50) NOT NULL
);
```

Insertar Datos:
```
-- Insertar usuarios
INSERT INTO "user" (email, password, rol)
VALUES 
('camilorayomejia@gmail.com', '123', 'ADMIN'),
('jhoan@gmail.com', '1234', 'OPERATOR'),
('hectorvelez@gmail.com', '1234', 'OPERATOR'),
('juandanielc@gmail.com', '1234', 'ADMIN');
```


Tabla orders;

```
-- Tabla orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    invoice_url VARCHAR(250),
    created_by VARCHAR(150),
    approved_by INTEGER,
    created_date TIMESTAMP DEFAULT NOW()
);
```

Tabla order_status_log: para cuando se cambia el estado de la ordern en la tabla orders automaticamente hace un tiggers

```
-- Tabla order_status_log
CREATE TABLE order_status_log (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by INTEGER
);
```
Tiggers:

```
-- Función para trigger que registra cambios de estado
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO order_status_log(order_id, old_status, new_status, changed_at, changed_by)
        VALUES (OLD.id, OLD.status, NEW.status, NOW(), NEW.approved_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger sobre orders
CREATE TRIGGER trigger_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();
```

Almacena los usuarios del sistema.

Campos principales:

id
Identificador único del usuario.

email
Correo electrónico utilizado para autenticación.

password
Contraseña almacenada de forma encriptada.

rol
Rol del usuario dentro del sistema (ADMIN u OPERATOR).


---

## Tabla orders

Tabla principal que almacena las órdenes de pago.

Campos principales:

id
Identificador de la orden.

title
Nombre o título de la orden.

description
Descripción de la orden.

amount
Monto asociado a la orden.

status
Estado actual de la orden.

invoice_url
URL del archivo de factura almacenado en el sistema de archivos.

created_by
Usuario que creó la orden.

approved_by
Usuario que aprobó la orden.

created_date
Fecha de creación.

approved_date
Fecha de aprobación.

---

## Tabla order_status_log

Tabla de auditoría que registra todos los cambios de estado de una orden.

Cada vez que una orden cambia de estado, un **trigger en la base de datos** inserta automáticamente un registro en esta tabla.

Campos principales:

id
Identificador del registro.

order_id
Orden asociada al cambio.

old_status
Estado anterior de la orden.

new_status
Nuevo estado de la orden.

changed_date
Fecha del cambio.

changed_by
Usuario que realizó el cambio.

---



# 5. Manejo de Errores

El backend implementa manejo centralizado de excepciones.

Se utilizan códigos HTTP apropiados:

401
No autenticado.

403
Sin permisos para acceder al recurso.

404
Recurso no encontrado.

500
Error interno del servidor.

---

# 12. Cómo Ejecutar el Proyecto

## Backend

1. Clonar el repositorio.  (desde la terminal en donde quieres guardar el proyecto escribes: git clone y colocas el SHH del repositorio)
2. Configurar las variables de entorno.
3. Ejecutar el proyecto Spring Boot.

Ejemplo:
Si quieres ejecutar solo el backend ingresas a la carpeta backend (cd backend) y ejecutas:
mvn spring-boot:run

---

## Frontend

1. Instalar dependencias.

npm install

2. Ejecutar solo el Frontend (cd frontend)
   
ng serve

3. Ejecutar la aplicación.

npm start

---


# 14. Decisiones Técnicas

Spring Boot fue elegido por su integración con Spring Security y facilidad para construir APIs REST robustas.

PostgreSQL fue seleccionado por su soporte avanzado para triggers, procedimientos almacenados y consistencia transaccional.

La arquitectura por capas fue implementada para mantener una clara separación de responsabilidades y facilitar el mantenimiento del sistema.

---

# 15. Funcionalidades Pendientes o Mejoras Futuras

* Error al mostrar la Factura o imagen (Impresión en formato estilistico)
* No se logró implementar buscar todas las órdenes con estado REJECTED cuya fecha de creación sea anterior a la fecha proporcionada. Actualizar dichas órdenes cambiando su estado a ARCHIVED.


# Punto que se tuvieron en cuenta: 
* Para lograr cambiar a ARCHIVADO despues de un lapso de tiempo (1 minuto) las ordenes que estaban en estado RECHAZADO se necesito ajustar un intervalo en el procedimiento.
* Ejecutar en mi postgresql:

```sql
CREATE OR REPLACE PROCEDURE archive_old_rejected_orders()
LANGUAGE plpgsql
AS $$
BEGIN
    BEGIN
        -- Actualiza todas las órdenes rechazadas con más de 1 minuto de antigüedad
        UPDATE orders
        SET status = 'ARCHIVADO'
        WHERE status = 'RECHAZADO'
          AND created_date <= NOW() - INTERVAL '1 minute';

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END;
END;
$$;
```

* Y posterior ejecutar:

```
CALL archive_old_rejected_orders();
```

