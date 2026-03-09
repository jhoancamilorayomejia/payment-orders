package com.example.backend.repositories;

import com.example.backend.models.OrderStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusLogRepository extends JpaRepository<OrderStatusLog, Long> {

    // =============================
    // HISTORIAL POR ORDEN
    // =============================
    List<OrderStatusLog> findByOrderIdOrderByChangedDateDesc(Long orderId);

    // =============================
    // HISTORIAL GLOBAL
    // =============================
    List<OrderStatusLog> findAllByOrderByChangedDateDesc();

}