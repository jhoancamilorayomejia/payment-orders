package com.example.backend.repositories;

import com.example.backend.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * OrderRepository
 *
 * Responsabilidad dentro del sistema:
 * Este repositorio se encarga de gestionar las operaciones de acceso a datos
 * relacionadas con la entidad Order. Permitiendo peticiones como guardar, 
 * actualizar y consultar órdenes almacenadas en la base de datos.
 *
 * Relación con otros componentes:
 * Es utilizado principalmente por el OrderController.java. Gracias a la extensión
 * de JpaRepository, Spring Data JPA genera automáticamente las operaciones
 * CRUD sin necesidad de escribir consultas SQL manualmente.
 *
 * Por qué existe dentro de la solución:
 * Existe para abstraer la capa de acceso a datos del resto de la aplicación,
 * siguiendo el patrón Repository. Esto permite mantener una arquitectura
 * limpia, separando la lógica de negocio de la lógica de persistencia y
 * facilitando el mantenimiento y la escalabilidad del sistema.
 */

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {}