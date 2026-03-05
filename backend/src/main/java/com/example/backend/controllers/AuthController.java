package com.example.backend.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.backend.repositories.UserRepository;
import com.example.backend.models.User;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public String login(@RequestBody User loginUser) {

        User user = userRepository.findByEmailAndPassword(
                loginUser.getEmail(),
                loginUser.getPassword()
        );

        if (user != null) {
            return "Inicio de sesión correcto";
        } else {
            return "Credenciales incorrectas";
        }
    }
}