package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * WebConfig
 *
 * Responsabilidad dentro del sistema:
 * Se encarga de configurar recursos estáticos personalizados en la aplicación.
 * Específicamente permite que los archivos almacenados en la carpeta
 * "uploads" del backend puedan ser accedidos mediante una URL pública.
 *
 * Relación con otros componentes:
 * Es utilizada por Spring MVC para servir archivos estáticos
 * que pueden haber sido cargados por controladores (por ejemplo, al subir
 * comprobantes de pago (PDF), imágenes (PNG, JPG, JPEG) u otros documentos desde el frontend).
 *
 * Por qué existe dentro de la solución:
 * Existe para mapear la ruta "/uploads/**" a una carpeta física del sistema de archivos.
 * Esto permite que los archivos subidos al servidor puedan ser consultados y
 * posteriormente desde el navegador.
 */

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        File projectRoot = new File(System.getProperty("user.dir")); // /payment-orders/backend
        File uploadsFolder = new File(projectRoot, "uploads"); // /payment-orders/backend/uploads

        System.out.println("Uploads folder absolute path: " + uploadsFolder.getAbsolutePath());

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsFolder.getAbsolutePath() + "/");
    }
}