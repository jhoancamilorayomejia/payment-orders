package com.example.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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