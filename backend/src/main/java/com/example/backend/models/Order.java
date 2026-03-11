package com.example.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order
 *
 * Responsabilidad dentro del sistema:
 * Esta clase representa la entidad de "Orden" (tabla orders) dentro del sistema de gestión
 * de pagos. Su función es modelar la información principal de una orden,
 * incluyendo su título, descripción, monto, estado, comprobante (invoice), así como
 * los datos relacionados con su creación y aprobación.
 *
 * Relación con otros componentes:
 * Esta entidad es utilizada por los repositorios (OrderRepository) para realizar
 * operaciones de persistencia en la base de datos mediante JPA/Hibernate.
 * También es utilizada por los servicios y controladores del sistema 
 * (OrderService y OrderController.java) para crear, consultar, actualizar y gestionar.
 *
 * Por qué existe dentro de la solución:
 * Existe para mapear la tabla "orders" de la base de datos,
 * permitiendo que Spring Boot utilice JPA para manejar automáticamente la
 * persistencia de datos. Esto facilita la manipulación de órdenes dentro
 * de la lógica del sistema y mantiene una estructura clara entre la base
 * de datos y la aplicación.
 */

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private BigDecimal amount;
    private String status;
    private String invoiceUrl;
    private String createdBy; // email del creador
    private Long approvedBy;  // CAMBIO: ahora guarda userId

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    public Order() {}

    public Order(String title, String description, BigDecimal amount, String status, String invoiceUrl,
                 String createdBy, Long approvedBy, LocalDateTime createdDate, LocalDateTime approvedDate) {
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.status = status;
        this.invoiceUrl = invoiceUrl;
        this.createdBy = createdBy;
        this.approvedBy = approvedBy;
        this.createdDate = createdDate;
        this.approvedDate = approvedDate;
    }

    // Getters y setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public String getInvoiceUrl() { return invoiceUrl; }
    public String getCreatedBy() { return createdBy; }
    public Long getApprovedBy() { return approvedBy; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getApprovedDate() { return approvedDate; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setStatus(String status) { this.status = status; }
    public void setInvoiceUrl(String invoiceUrl) { this.invoiceUrl = invoiceUrl; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public void setApprovedBy(Long approvedBy) { this.approvedBy = approvedBy; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }
}