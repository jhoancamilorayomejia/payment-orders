package com.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Collections;

/**
 * JwtFilter
 *
 * Responsabilidad dentro del sistema:
 * Esta clase actúa como un filtro de seguridad encargado de interceptar
 * todas las solicitudes HTTP entrantes al backend para validar el token
 * JWT enviado por el cliente. Su función principal es verificar que el
 * token sea válido antes de permitir el acceso a los endpoints protegidos.
 *
 * Relación con otros componentes:
 * Este filtro trabaja en conjunto con la clase JwtUtil, que se encarga
 * de generar, validar y extraer información del token JWT. Además, se
 * integra con el sistema de seguridad de Spring Security utilizando
 * SecurityContextHolder para establecer la autenticación del usuario
 * en el contexto de la aplicación.
 *
 * También interactúa con los controladores del sistema, ya que protege
 * sus endpoints asegurando que solo los usuarios autenticados puedan
 * acceder a ellos.
 *
 * Por qué existe dentro de la solución:
 * Existe para implementar un mecanismo de autenticación basado en
 * tokens JWT. Cada solicitud al backend debe incluir un token válido
 * en el encabezado Authorization. Si el token es válido, el usuario
 * es autenticado y puede acceder a los recursos protegidos; de lo
 * contrario, la solicitud es rechazada con un error de autorización.
 */

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // endpoint público sin token (ruta publica para ver las ordenes)
        if (request.getRequestURI().equals("/custom-response")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (!jwtUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token inválido o expirado");
                return;
            }

            String email = jwtUtil.extractEmail(token);
            String rol = jwtUtil.extractRol(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());

            SecurityContextHolder.getContext().setAuthentication(authentication);
            request.setAttribute("rol", rol);
        } else if (!request.getRequestURI().startsWith("/api/auth")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Se requiere autenticación");
            return;
        }

        filterChain.doFilter(request, response);
    }
}