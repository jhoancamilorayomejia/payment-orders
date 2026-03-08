package com.example.backend.models;

import jakarta.persistence.*;
import java.math.BigDecimal;

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

    private String invoiceUrl; // URL del PDF subido

    public Order() {}

    public Order(String title, String description, BigDecimal amount, String status, String invoiceUrl) {
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.status = status;
        this.invoiceUrl = invoiceUrl;
    }

    // Getters y setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public String getStatus() { return status; }
    public String getInvoiceUrl() { return invoiceUrl; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setStatus(String status) { this.status = status; }
    public void setInvoiceUrl(String invoiceUrl) { this.invoiceUrl = invoiceUrl; }
}