package com.example.backend.controllers;

import com.example.backend.models.Order;
import com.example.backend.models.OrderStatusLog;
import com.example.backend.repositories.OrderRepository;
import com.example.backend.repositories.OrderStatusLogRepository;
import com.example.backend.security.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderStatusLogRepository orderStatusLogRepository;
    private final JwtUtil jwtUtil;

    public OrderController(OrderRepository orderRepository, JwtUtil jwtUtil,
                           OrderStatusLogRepository orderStatusLogRepository) {
        this.orderRepository = orderRepository;
        this.jwtUtil = jwtUtil;
        this.orderStatusLogRepository = orderStatusLogRepository;
    }

    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String amount,
            @RequestParam String status,
            @RequestParam(name = "invoice_url", required = false) MultipartFile file,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            Order order = new Order();
            order.setTitle(title);
            order.setDescription(description);
            order.setAmount(new BigDecimal(amount));
            order.setStatus(status);

            // email del creador
            String userEmail = extractEmailFromToken(authHeader);
            order.setCreatedBy(userEmail);

            order.setCreatedDate(LocalDateTime.now());
            order.setApprovedDate(null);
            order.setApprovedBy(null);

            // manejo de archivo
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || !(contentType.equals("application/pdf") ||
                        contentType.equals("image/png") ||
                        contentType.equals("image/jpeg"))) {
                    return ResponseEntity.badRequest()
                            .body("Tipo de archivo no permitido. Solo PDF, PNG o JPG.");
                }
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body("Archivo demasiado grande. Máximo 5MB.");
                }

                File projectRoot = new File(System.getProperty("user.dir"));
                File folder = new File(projectRoot, "uploads");
                if (!folder.exists()) folder.mkdirs();

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File destinationFile = new File(folder, fileName);
                file.transferTo(destinationFile);
                order.setInvoiceUrl("/uploads/" + fileName);
            }

            Order saved = orderRepository.save(order);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al guardar el archivo: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al crear la orden: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam Long userId
    ) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

            String oldStatus = order.getStatus(); // para historial
            order.setStatus(status);

            if (status.equalsIgnoreCase("APROBADO") || status.equalsIgnoreCase("RECHAZADO")) {
                order.setApprovedBy(userId);  // ahora guarda userId
                order.setApprovedDate(LocalDateTime.now());
            } else {
                order.setApprovedBy(null);
                order.setApprovedDate(null);
            }

            // Guardar registro en order_status_log
            OrderStatusLog log = new OrderStatusLog();
            log.setOrderId(order.getId());
            log.setOldStatus(oldStatus);
            log.setNewStatus(status);
            log.setChangedDate(LocalDateTime.now());
            log.setChangedBy(userId);
            orderStatusLogRepository.save(log);

            Order updated = orderRepository.save(order);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar la orden: " + e.getMessage());
        }
    }

    // Nuevo endpoint para historial de estados
    @GetMapping("/{id}/status-log")
    public ResponseEntity<?> getOrderStatusLog(@PathVariable Long id) {
        try {
            List<OrderStatusLog> log = orderStatusLogRepository.findByOrderIdOrderByChangedDateDesc(id);
            return ResponseEntity.ok(log);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener historial de estados: " + e.getMessage());
        }
    }

    // =============================
// HISTORIAL GLOBAL DE ESTADOS
// =============================
@GetMapping("/status-log")
public ResponseEntity<?> getAllOrderStatusLogs() {

    try {

        List<OrderStatusLog> logs = orderStatusLogRepository
                .findAllByOrderByChangedDateDesc();

        return ResponseEntity.ok(logs);

    } catch (Exception e) {

        return ResponseEntity
                .status(500)
                .body("Error al obtener historial global: " + e.getMessage());

    }

}

    private String extractEmailFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractEmail(token);
        }
        return "desconocido";
    }

    
}