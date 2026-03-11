package com.example.backend.repositories;

import com.example.backend.models.OrderStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * OrderStatusLogRepository
 *
 * Responsabilidad dentro del sistema:
 * Este repositorio se encarga de gestionar el acceso a los datos relacionados
 * con el historial de cambios de estado de las órdenes. Permite consultar,
 * guardar y administrar los registros almacenados en la tabla
 * "order_status_log".
 *
 * Relación con otros componentes:
 * Es utilizado principalmente por el OrderController.java para consultar el
 * historial de cambios de estado de las órdenes. Trabaja directamente
 * con la entidad OrderStatusLog y utiliza Spring Data JPA para generar
 * automáticamente las operaciones de persistencia.
 *
 * Por qué existe dentro de la solución:
 * Existe para proporcionar una capa de acceso a datos que permita consultar
 * el historial de estados de las órdenes de manera eficiente. Esto facilita
 * mantener trazabilidad y auditoría de los cambios realizados en el sistema,
 * permitiendo conocer cuándo cambió el estado de una orden y quién realizó
 * la modificación.
 */

@Repository
public interface OrderStatusLogRepository extends JpaRepository<OrderStatusLog, Long> {

    // =============================
    // HISTORIAL POR ORDEN
    // =============================
    List<OrderStatusLog> findByOrderIdOrderByChangedDateDesc(Long orderId);

    // =============================
    // HISTORIAL GLOBAL
    // =============================
    List<OrderStatusLog> findAllByOrderByChangedDateDesc();

}