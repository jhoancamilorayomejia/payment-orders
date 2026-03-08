package com.example.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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