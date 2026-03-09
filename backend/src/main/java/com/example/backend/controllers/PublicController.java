package com.example.backend.controllers;

import com.example.backend.models.Order;
import com.example.backend.repositories.OrderRepository;

import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class PublicController {

    private final OrderRepository orderRepository;

    public PublicController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/custom-response")
    public List<Map<String, Object>> customResponse() {

        List<Order> orders = orderRepository.findAll();

        return orders.stream().map(order -> {
            Map<String, Object> data = new HashMap<>();

            data.put("id", order.getId());
            data.put("status", order.getStatus());
            data.put("approved_date", order.getApprovedDate());
            data.put("approved_by", order.getApprovedBy());

            return data;
        }).collect(Collectors.toList());
    }
}