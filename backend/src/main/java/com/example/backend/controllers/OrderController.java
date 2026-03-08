package com.example.backend.controllers;

import com.example.backend.models.Order;
import com.example.backend.repositories.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
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
            @RequestParam(name = "invoice_url", required = false) MultipartFile file
    ) {
        try {
            Order order = new Order();
            order.setTitle(title);
            order.setDescription(description);
            order.setAmount(new BigDecimal(amount));
            order.setStatus(status);

            if (file != null && !file.isEmpty()) {

                // Validar tipo
                String contentType = file.getContentType();
                if (contentType == null ||
                        !(contentType.equals("application/pdf") ||
                          contentType.equals("image/png") ||
                          contentType.equals("image/jpeg"))) {
                    return ResponseEntity.badRequest()
                            .body("Tipo de archivo no permitido. Solo PDF, PNG o JPG.");
                }

                // Validar tamaño
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body("Archivo demasiado grande. Máximo 5MB.");
                }

                // Carpeta uploads dentro de backend
                File projectRoot = new File(System.getProperty("user.dir")); // /payment-orders/backend
                File folder = new File(projectRoot, "uploads"); // /payment-orders/backend/uploads
                if (!folder.exists()) folder.mkdirs();

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File destinationFile = new File(folder, fileName);
                file.transferTo(destinationFile);

                // Guardar URL relativa para frontend
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
}