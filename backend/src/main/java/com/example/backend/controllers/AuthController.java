package com.example.backend.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.backend.repositories.UserRepository;
import com.example.backend.models.User;
import com.example.backend.security.JwtUtil;

import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * AuthController
 *
 * Responsabilidad dentro del sistema:
 * Esta clase se encarga de gestionar la autenticación de los usuarios
 * dentro del sistema. Su principal función es validar las credenciales
 * enviadas desde el frontend y generar un token JWT cuando el usuario
 * se autentica correctamente.
 *
 * Relación con otros componentes:
 * Este controlador interactúa con el UserRepository para consultar los
 * datos del usuario almacenados en la base de datos. También utiliza
 * la clase JwtUtil para generar tokens de autenticación que permiten
 * proteger los endpoints del sistema. Es consumido directamente por
 * el frontend (Angular) a través de la ruta /api/auth/login.
 *
 * Por qué existe dentro de la solución:
 * Existe para centralizar el proceso de autenticación del sistema.
 * Permite validar las credenciales del usuario y generar un token
 * JWT que será utilizado posteriormente para autorizar el acceso
 * a otros endpoints protegidos de la aplicación.
 */

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User loginUser) {

        User user = userRepository.findByEmailAndPassword(
                loginUser.getEmail(),
                loginUser.getPassword()
        );

        Map<String, Object> resp = new HashMap<>();

        if (user != null) {

            String token = jwtUtil.generateToken(user);

            resp.put("success", true);
            resp.put("message", "Login exitoso");
            resp.put("rol", user.getRol());
            resp.put("token", token);

        } else {
            resp.put("success", false);
            resp.put("message", "Credenciales incorrectas");
        }

        return ResponseEntity.ok(resp);
    }
}