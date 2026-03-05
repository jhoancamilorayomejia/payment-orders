package com.example.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.repositories.UserRepository;

@RestController
@RequestMapping("/test")
public class TestController {

    private final UserRepository userRepository;

    public TestController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/db")
    public String testDb() {
        long count = userRepository.count();
        return "Conexión OK. Usuarios en BD: " + count;
    }
}