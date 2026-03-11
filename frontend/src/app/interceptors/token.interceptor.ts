import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * tokenInterceptor
 *
 * Responsabilidad dentro del sistema:
 * Intercepta todas las solicitudes HTTP salientes y agrega automáticamente
 * el token JWT en el encabezado Authorization si el usuario está logueado.
 * También maneja errores de autenticación (401), forzando al usuario a
 * reingresar en caso de sesión expirada.
 *
 * Relación con otros componentes:
 * - Intercepta peticiones enviadas por los servicios de Angular (HttpClient).
 * - Utiliza Router para redirigir al login cuando la sesión ha expirado.
 * - Interactúa indirectamente con AuthGuard y cualquier componente que
 *   haga llamadas a la API que requieran autenticación.
 *
 * Por qué existe dentro de la solución:
 * Asegura que todas las llamadas al backend estén autenticadas y proporciona
 * un manejo centralizado de tokens expirados, evitando repetir lógica en
 * cada servicio o componente.
 */


export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(

    catchError((error) => {

      if (error.status === 401) {

        alert("Sesión expirada. Debes iniciar sesión nuevamente.");

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        router.navigate(['/']);
      }

      return throwError(() => error);
    })

  );
};