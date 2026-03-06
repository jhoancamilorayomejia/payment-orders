package com.example.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "\"user\"") // tu tabla se llama "user"
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String rol; // <-- agrega esta columna

    // getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRol() {      // <-- getter para rol
        return rol;
    }

    public void setRol(String rol) { // <-- setter para rol
        this.rol = rol;
    }
}