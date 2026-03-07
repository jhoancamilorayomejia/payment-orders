package com.example.backend.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.backend.models.Order;
import com.example.backend.repositories.OrderRepository;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }
}