package com.example.backend.controllers;

import org.springframework.web.bind.annotation.*;
import com.example.backend.repositories.UserRepository;
import com.example.backend.models.User;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User loginUser) {

        User user = userRepository.findByEmailAndPassword(
                loginUser.getEmail(),
                loginUser.getPassword()
        );

        Map<String, Object> resp = new HashMap<>();

        if (user != null) {
            resp.put("success", true);
            resp.put("message", "Inicio de sesión correcto");
            //resp.put("userId", user.getId()); // opcional, puedes usarlo después
        } else {
            resp.put("success", false);
            resp.put("message", "Credenciales incorrectas");
        }

        return ResponseEntity.ok(resp);
    }
}