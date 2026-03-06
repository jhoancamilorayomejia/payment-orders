import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

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