package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig
 *
 * Responsabilidad dentro del sistema:
 * Esta clase configura la seguridad del backend, definiendo qué endpoints
 * son públicos, cuáles requieren autenticación y cómo se aplica el filtro
 * de JWT en cada solicitud HTTP.
 *
 * Relación con otros componentes:
 * - Integra JwtFilter para validar tokens JWT en cada petición.
 * - Trabaja con Spring Security para establecer reglas de autorización y
 *   autenticación.
 * - Colabora indirectamente con AuthController.java y JwtUtil.java, ya que protege
 *   los endpoints y asegura que solo usuarios autenticados puedan acceder
 *   a los recursos sensibles como /api/orders o /api/files.
 *
 * Por qué existe dentro de la solución:
 * Existe para centralizar la configuración de seguridad del sistema, 
 * asegurando que:
 * - Los endpoints públicos (login, recursos públicos y uploads) estén
 *   accesibles sin token.
 * - Los endpoints sensibles requieran un token JWT válido.
 * - Se integre de forma transparente con Spring Security para que el
 *   filtro de autenticación se ejecute antes de procesar las solicitudes.
 */

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/custom-response").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                .requestMatchers("/api/files/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}