import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  email: string = '';
  password: string = '';
  message: string = '';


  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn = false; // control de sesión

login() {
  const body = { email: this.email, password: this.password };

  this.http.post<{ success: boolean, message: string }>(
    'http://localhost:8080/api/auth/login', body
  ).subscribe({
    next: (res) => {
      if (res.success) {
        this.isLoggedIn = true;       // ya logueado
        this.router.navigate(['/dashboard']); // redirige a dashboard
      } else {
        this.message = res.message;
      }
    },
    error: (err) => {
      this.message = 'Error de conexión con el servidor';
    }
  });
}
}
