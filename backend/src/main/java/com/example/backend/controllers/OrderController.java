package com.example.backend.controllers;

import com.example.backend.models.Order;
import com.example.backend.repositories.OrderRepository;
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
    private final JwtUtil jwtUtil;

    public OrderController(OrderRepository orderRepository, JwtUtil jwtUtil) {
        this.orderRepository = orderRepository;
        this.jwtUtil = jwtUtil;
    }

    // -----------------------------
    // Obtener todas las órdenes
    // -----------------------------
    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

    // -----------------------------
    // Crear nueva orden con archivo
    // -----------------------------
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

            // -----------------------------
            // Asignar usuario creador
            // -----------------------------
            String userEmail = extractEmailFromToken(authHeader);
            order.setCreatedBy(userEmail);

            // -----------------------------
            // Fechas automáticas
            // -----------------------------
            order.setCreatedDate(LocalDateTime.now());
            order.setApprovedDate(null);

            // -----------------------------
            // Aún no aprobado
            // -----------------------------
            order.setApprovedBy(null);

            // -----------------------------
            // Manejo del archivo
            // -----------------------------
            if (file != null && !file.isEmpty()) {

                String contentType = file.getContentType();

                if (contentType == null ||
                        !(contentType.equals("application/pdf") ||
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

                if (!folder.exists()) {
                    folder.mkdirs();
                }

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

                File destinationFile = new File(folder, fileName);

                file.transferTo(destinationFile);

                order.setInvoiceUrl("/uploads/" + fileName);
            }

            Order saved = orderRepository.save(order);

            return ResponseEntity.ok(saved);

        } catch (IOException e) {

            return ResponseEntity.status(500)
                    .body("Error al guardar el archivo: " + e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.status(500)
                    .body("Error al crear la orden: " + e.getMessage());
        }
    }

    // -----------------------------
    // ACTUALIZAR STATUS DE ORDEN
    // -----------------------------
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

            // actualizar estado
            order.setStatus(status);

            // usuario que aprueba
            String userEmail = extractEmailFromToken(authHeader);
            order.setApprovedBy(userEmail);

            // fecha aprobación
            order.setApprovedDate(LocalDateTime.now());

            Order updated = orderRepository.save(order);

            return ResponseEntity.ok(updated);

        } catch (Exception e) {

            return ResponseEntity.status(500)
                    .body("Error al actualizar la orden: " + e.getMessage());
        }
    }

    // -----------------------------
    // Método auxiliar para extraer email del JWT
    // -----------------------------
    private String extractEmailFromToken(String authHeader) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            return jwtUtil.extractEmail(token);
        }

        return "desconocido";
    }
}