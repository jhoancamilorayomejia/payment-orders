package com.example.backend.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import com.example.backend.models.User;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET_KEY = "mi_clave_super_segura_que_debe_ser_larga";

    // 24 horas
    private final long EXPIRATION_TIME = 1000L * 60 * 60 * 24;

    // --------------------------------
    // Generar token
    // --------------------------------
    public String generateToken(User user) {

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())   // ← ID DEL USUARIO
                .claim("rol", user.getRol())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();

    }

    // --------------------------------
    // Extraer email
    // --------------------------------
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // --------------------------------
    // Extraer rol
    // --------------------------------
    public String extractRol(String token) {
        return (String) getClaims(token).get("rol");
    }

    // --------------------------------
    // Extraer ID del usuario
    // --------------------------------
    public Long extractUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    // --------------------------------
    // Validar token
    // --------------------------------
    public boolean validateToken(String token) {

        try {

            getClaims(token);

            return true;

        } catch (JwtException | IllegalArgumentException e) {

            return false;

        }

    }

    // --------------------------------
    // Obtener claims del token
    // --------------------------------
    private Claims getClaims(String token) {

        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();

    }

}