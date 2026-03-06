import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


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