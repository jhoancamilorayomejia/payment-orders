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

backend/

controller
Expone los endpoints REST del sistema.


repository
Capa de acceso a datos utilizando JPA.

model
Representación de las entidades del sistema.

config
Permite que los archivos guardados en la carpeta uploads sean accesibles mediante un URL. 

security
Configuración de autenticación JWT y autorización por roles. (creacion de token y su tiempo de expiración) 

models.
contiene las clases que representan las entidades del dominio del sistema.Cada clase normalmente corresponde a una tabla en la base de datos.



---

# 4. Modelo de Base de Datos

El sistema utiliza las siguientes tablas principales.

---

## Tabla "user"

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

