import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  email: string = '';
  password: string = '';
  message: string = '';
  isLoggedIn = false;

  // 🔹 NUEVO: estado del modal de órdenes
  isOrdersModalOpen = false;

  // 🔹 NUEVO: arreglo para almacenar las órdenes del backend
  orders: OrderData[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {

    const token = localStorage.getItem("token");

    if (token) {

      this.isLoggedIn = true;

      const role = localStorage.getItem("role");

      if (role === 'ADMIN') {
        this.router.navigate(['/dashboard']);
      }

      if (role === 'OPERATOR') {
        this.router.navigate(['/operator']);
      }

    }

    // revisar expiración del token constantemente
    setInterval(() => {
      this.checkTokenExpiration();
    }, 1000);

  }

  login() {

    const body = { email: this.email, password: this.password };

    this.http.post<{ success: boolean, message: string, rol: string, token: string }>(
      'http://localhost:8080/api/auth/login', body
    ).subscribe({

      next: (res) => {

        if (res.success) {

          // guardar token
          localStorage.setItem("token", res.token);
          localStorage.setItem("role", res.rol);

          this.isLoggedIn = true;

          if (res.rol === 'ADMIN') {
            this.router.navigate(['/dashboard']);
          }

          if (res.rol === 'OPERATOR') {
            this.router.navigate(['/operator']);
          }

        } else {
          this.message = res.message;
        }

      },

      error: () => {
        this.message = 'Error de conexión con el servidor';
      }

    });

  }

  // 🔐 verificar expiración del token
  checkTokenExpiration() {

    const token = localStorage.getItem("token");

    if (!token) return;

    try {

      const decoded: any = jwtDecode(token);

      const exp = decoded.exp * 1000; // convertir a milisegundos
      const now = Date.now();

      if (exp < now) {

        alert("Sesión expirada. Debes iniciar sesión nuevamente.");

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        this.isLoggedIn = false;

        this.router.navigate(['/']);
      }

    } catch (error) {

      localStorage.removeItem("token");
      localStorage.removeItem("role");

      this.router.navigate(['/']);

    }

  }

  // 🔹 NUEVOS MÉTODOS PARA EL MODAL
  openOrdersModal() {
  this.isOrdersModalOpen = true;

  // Traer datos del backend al abrir el modal
  this.http.get<OrderData[]>('http://localhost:8080/custom-response')
    .subscribe({
      next: (res) => {
        // 🔹 Filtrar solo los aprobados
        this.orders = res.filter(order => order.status === 'APROBADO');
      },
      error: (err) => {
        console.error('Error al obtener órdenes:', err);
        this.orders = [];
      }
    });
}

  closeOrdersModal() {
    this.isOrdersModalOpen = false;
  }

}

// 🔹 NUEVA INTERFAZ para tipar los datos del endpoint
interface OrderData {
  id: number;
  status: string;
  approved_date: string | null;
  approved_by: string | null;
}