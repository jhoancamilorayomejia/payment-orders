package com.example.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // getters y setters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
}