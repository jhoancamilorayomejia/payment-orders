import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

/**
 * AuthGuard
 *
 * Responsabilidad dentro del sistema:
 * Este guard protege rutas del frontend, asegurándose de que solo
 * usuarios autenticados puedan acceder a ciertas páginas. Además,
 * valida que el usuario tenga el rol permitido según la configuración
 * de la ruta.
 *
 * Relación con otros componentes:
 * - Interactúa con el Router para redirigir usuarios no autorizados
 *   a la página de login.
 * - Se integra con rutas definidas en el módulo de Angular mediante
 *   `canActivate` y la propiedad `data.roles`.
 *
 * Por qué existe dentro de la solución:
 * Garantiza la seguridad en el frontend, evitando que usuarios sin
 * sesión activa o con roles incorrectos accedan a secciones restringidas.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: any): boolean {

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // ❌ No hay token
    if (!token) {
      alert("Debes iniciar sesión primero");
      this.router.navigate(['/']);
      return false;
    }

    // 🔐 Validar roles
    const allowedRoles = route.data['roles'];

    if (allowedRoles && !allowedRoles.includes(role)) {
      alert("No tienes permisos para entrar aquí");
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}