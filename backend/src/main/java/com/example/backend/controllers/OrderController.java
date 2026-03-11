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

/**
 * OrderController
 *
 * Responsabilidad dentro del sistema:
 * Esta clase es el controlador encargado de gestionar todas las operaciones
 * relacionadas con las órdenes dentro del sistema. Permite crear órdenes,
 * consultar órdenes existentes, actualizar su estado y consultar el historial
 * de cambios de estado asociados a cada orden.
 *
 * Relación con otros componentes:
 * Este controlador interactúa con varias capas del sistema:
 * - OrderRepository: para realizar operaciones CRUD sobre la entidad Order
 *   almacenada en la base de datos.
 * - OrderStatusLogRepository: para consultar el historial de cambios de estado
 *   de las órdenes.
 * - JwtUtil: para extraer información del usuario autenticado a partir del
 *   token JWT enviado desde el frontend.
 *
 * Además, es consumido por el frontend (Angular) mediante endpoints REST.
 *
 * Por qué existe dentro de la solución:
 * Esta clase existe para centralizar la lógica de gestión de órdenes dentro
 * del sistema. Permite que los usuarios puedan:
 * - Crear nuevas órdenes con información básica y archivos adjuntos.
 * - Consultar todas las órdenes registradas.
 * - Actualizar el estado de una orden (por ejemplo APROBADO o RECHAZADO).
 * - Consultar el historial de cambios de estado para auditoría y trazabilidad.
 *
 * También gestiona la validación básica de archivos adjuntos (tipo y tamaño)
 * y el almacenamiento de estos documentos en la carpeta "uploads" del servidor.
 */

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

    
    // OBTENER TODAS LAS ORDENES
   
    @GetMapping
    public List<Order> getOrders() {
        return orderRepository.findAll();
    }

   
    // CREAR NUEVA ORDEN
    
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

            String userEmail = extractEmailFromToken(authHeader);
            order.setCreatedBy(userEmail);
            order.setCreatedDate(LocalDateTime.now());
            order.setApprovedDate(null);
            order.setApprovedBy(null);

            // Manejo de archivo adjunto
            if (file != null && !file.isEmpty()) {
                String contentType = file.getContentType();
                if (contentType == null || !(contentType.equals("application/pdf") ||
                        contentType.equals("image/png") || contentType.equals("image/jpeg"))) {
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

    // =============================
    // ACTUALIZAR ESTADO DE ORDEN
    // =============================
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam Long userId
    ) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Orden no encontrada"));

            order.setStatus(status);

            if (status.equalsIgnoreCase("APROBADO") || status.equalsIgnoreCase("RECHAZADO")) {
                order.setApprovedBy(userId);
                order.setApprovedDate(LocalDateTime.now());
            } else {
                order.setApprovedBy(null);
                order.setApprovedDate(null);
            }

            // Guardar la orden (el trigger se encargará del log)
            orderRepository.save(order);

            return ResponseEntity.ok(order);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar la orden: " + e.getMessage());
        }
    }

    // =============================
    // HISTORIAL POR ORDEN
    // =============================
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
    // HISTORIAL GLOBAL
    // =============================
    @GetMapping("/status-log")
    public ResponseEntity<?> getAllOrderStatusLogs() {
        try {
            List<OrderStatusLog> logs = orderStatusLogRepository.findAllByOrderByChangedDateDesc();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener historial global: " + e.getMessage());
        }
    }

    // =============================
    // EXTRAER EMAIL DEL TOKEN JWT
    // =============================
    private String extractEmailFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractEmail(token);
        }
        return "desconocido";
    }

}