package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.models.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}