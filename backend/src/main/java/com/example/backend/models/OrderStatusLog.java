package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * OrderStatusLog
 *
 * Responsabilidad dentro del sistema:
 * Esta clase representa el historial de cambios de estado de una orden que viene de la tabla orders
 * de mi posgresql. Su función es registrar cada vez que una orden cambia de estado,
 * almacenando el estado anterior, el nuevo estado, la fecha del cambio
 * y el usuario que realizó la modificación.
 *
 * Relación con otros componentes:
 * Esta entidad está relacionada con la entidad Order mediante el campo
 * orderId, el cual identifica a qué orden pertenece el registro del cambio.
 * Es utilizada por los servicios o controladores (OrderController.java, PublicController.java)
 * que gestionan la lógica de actualización de estados de las órdenes,
 * así como por los repositorios que permiten persistir estos registros en la base de datos.
 *
 * Por qué existe dentro de la solución:
 * Existe para mantener un historial de los cambios de estado
 * de las órdenes dentro del sistema. Esto permite tener trazabilidad sobre
 * quién realizó un cambio, cuándo se hizo (fecha y hora) y cuál fue la transición de estado,
 * lo cual es útil para control, seguimiento y análisis de procesos.
 */

@Entity
@Table(name = "order_status_log")
public class OrderStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "old_status", nullable = false)
    private String oldStatus;

    @Column(name = "new_status", nullable = false)
    private String newStatus;

    @Column(name = "changed_date", nullable = false)
    private LocalDateTime changedDate;

    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    public OrderStatusLog() {}

    public OrderStatusLog(Long orderId, String oldStatus, String newStatus, LocalDateTime changedDate, Long changedBy) {
        this.orderId = orderId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedDate = changedDate;
        this.changedBy = changedBy;
    }

    // Getters
    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public String getOldStatus() { return oldStatus; }
    public String getNewStatus() { return newStatus; }
    public LocalDateTime getChangedDate() { return changedDate; }
    public Long getChangedBy() { return changedBy; }

    // Setters
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
    public void setChangedDate(LocalDateTime changedDate) { this.changedDate = changedDate; }
    public void setChangedBy(Long changedBy) { this.changedBy = changedBy; }
}