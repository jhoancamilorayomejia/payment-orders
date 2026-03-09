package com.example.backend.controllers;

import com.example.backend.models.Order;
import com.example.backend.models.User;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class PublicController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository; // 🔹 Inyectamos UserRepository

    public PublicController(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/custom-response")
    public List<Map<String, Object>> customResponse() {

        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                // 🔹 Filtrar solo aprobadas si quieres
                .filter(order -> "APROBADO".equals(order.getStatus()))
                .map(order -> {
                    Map<String, Object> data = new HashMap<>();

                    data.put("id", order.getId());
                    data.put("status", order.getStatus());
                    data.put("approved_date", order.getApprovedDate());

                    // 🔹 Traducir approved_by (ID) a email
                    if (order.getApprovedBy() != null) {
                        Optional<User> userOpt = userRepository.findById(order.getApprovedBy());
                        data.put("approved_by", userOpt.map(User::getEmail).orElse("-"));
                    } else {
                        data.put("approved_by", "-");
                    }

                    return data;
                })
                .collect(Collectors.toList());
    }
}