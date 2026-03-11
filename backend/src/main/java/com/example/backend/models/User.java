package com.example.backend.models;

import jakarta.persistence.*;

/**
 * User
 *
 * Responsabilidad dentro del sistema:
 * Esta clase representa la entidad de usuario ("user") dentro del sistema. Su función
 * es almacenar la información básica necesaria para la autenticación y
 * autorización de los usuarios, como el correo electrónico, la contraseña
 * y el rol que determina sus permisos dentro de la aplicación.
 *
 * Relación con otros componentes:
 * Esta entidad es utilizada por los repositorios para realizar operaciones
 * de persistencia en la base de datos. También es utilizada por los componentes 
 * de seguridad del sistema (como filtros JWT,
 * controladores de autenticación y servicios de login) para validar
 * credenciales y determinar los permisos de acceso de cada usuario mediante del token.
 *
 * Por qué existe dentro de la solución:
 * Existe para mapear la tabla "user" de la base de datos a un objeto Java,
 * permitiendo gestionar la autenticación y el control de acceso dentro
 * del sistema. El campo "rol" permite diferenciar los tipos de usuarios,
 * ADMIN u OPERATOR, y aplicar reglas de seguridad según el perfil del usuario
 * Para dar acceso a nuevas rutas.
 */

@Entity
@Table(name = "\"user\"") // tu tabla se llama "user"
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String rol; 

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