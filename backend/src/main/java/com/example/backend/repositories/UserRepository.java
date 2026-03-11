package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.models.User;

/**
 * UserRepository
 *
 * Responsabilidad dentro del sistema:
 * Este repositorio se encarga de gestionar el acceso a los datos de los
 * usuarios almacenados en la base de datos (user). Permite realizar operaciones
 * de persistencia como consultar, guardar, actualizar registros
 * de la entidad user.
 *
 * Relación con otros componentes:
 * Es utilizado principalmente por el AuthController.java para validar las
 * credenciales de los usuarios durante el proceso de autenticación.
 *
 * Por qué existe dentro de la solución:
 * Existe para abstraer la lógica de acceso a datos de la aplicación,
 * permitiendo que otras capas del sistema interactúen con la información
 * de los usuarios de forma sencilla y desacoplada. También define el
 * método findByEmailAndPassword que permite validar las credenciales
 * del usuario durante el proceso de login.
 */

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmailAndPassword(String email, String password);

}