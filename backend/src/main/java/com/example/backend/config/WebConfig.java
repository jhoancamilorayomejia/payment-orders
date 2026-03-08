package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

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