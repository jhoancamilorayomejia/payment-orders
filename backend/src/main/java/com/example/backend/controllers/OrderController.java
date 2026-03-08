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
    // Crear nueva orden con archivo (PDF, PNG, JPG)
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

                // -----------------------------
                // Validar tipo de archivo
                // -----------------------------
                String contentType = file.getContentType();
                if (contentType == null ||
                        !(contentType.equals("application/pdf") ||
                          contentType.equals("image/png") ||
                          contentType.equals("image/jpeg") ||
                          contentType.equals("image/jpg"))) {
                    return ResponseEntity.badRequest()
                            .body("Tipo de archivo no permitido. Solo PDF, PNG o JPG.");
                }

                // -----------------------------
                // Validar tamaño máximo (5MB)
                // -----------------------------
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body("Archivo demasiado grande. Máximo 5MB.");
                }

                // -----------------------------
                // Guardar archivo en carpeta uploads/
                // -----------------------------
                File projectRoot = new File(System.getProperty("user.dir")); // backend
                File folder = new File(projectRoot.getParentFile(), "uploads"); // /payment-orders/uploads
                if (!folder.exists()) folder.mkdirs();

                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File destinationFile = new File(folder, fileName);
                file.transferTo(destinationFile);

                // Guardar URL relativa en la DB
                order.setInvoiceUrl("/uploads/" + fileName);
            }

            // -----------------------------
            // Guardar la orden en la base de datos
            // -----------------------------
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