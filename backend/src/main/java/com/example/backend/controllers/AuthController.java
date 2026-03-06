package com.example.backend.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.backend.repositories.UserRepository;
import com.example.backend.models.User;
import com.example.backend.security.JwtUtil;

import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

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