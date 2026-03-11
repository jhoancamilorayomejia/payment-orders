package com.example.backend.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import com.example.backend.models.User;
import java.util.Date;

/**
 * JwtUtil
 *
 * Responsabilidad dentro del sistema:
 * Esta clase se encarga de generar, validar y extraer información de los
 * tokens JWT utilizados para la autenticación de los usuarios dentro del sistema.
 *
 * Relación con otros componentes:
 * Trabaja en conjunto con el AuthController.java, que utiliza esta clase para
 * generar un token cuando un usuario inicia sesión correctamente. También
 * es utilizada por el JwtFilter para validar el token en cada solicitud
 * HTTP y extraer la información del usuario autenticado.
 *
 * Por qué existe dentro de la solución:
 * Existe para implementar un mecanismo de autenticación basado en tokens
 * JWT, permitiendo que el backend verifique la identidad del usuario en
 * cada petición sin necesidad de mantener sesiones en el servidor. El
 * token incluye información como el email, el ID del usuario y su rol,
 * lo que permite controlar el acceso a los diferentes recursos del sistema.
 */

@Component
public class JwtUtil {

    private final String SECRET_KEY = "mi_clave_super_segura_que_debe_ser_larga";

    // 24 horas
    private final long EXPIRATION_TIME = 1000L * 60 * 60 * 24;

    // 1 minuto
    //private final long EXPIRATION_TIME = 1000L * 60;
    //1000L * 10;

    // --------------------------------
    // Generar token
    // --------------------------------
    public String generateToken(User user) {

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
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