import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * OrderService
 *
 * Responsabilidad dentro del sistema:
 * Proporciona métodos para interactuar con el backend y manejar órdenes,
 * incluyendo la obtención de todas las órdenes y la creación de nuevas órdenes
 * (con soporte para archivos adjuntos). Se encarga de enviar los headers de
 * autenticación en cada petición.
 *
 * Relación con otros componentes:
 * - Consumido por componentes Angular como `DashboardComponent` y
 *   `OperatorComponent` para mostrar, crear y actualizar órdenes.
 * - Se comunica con el backend (Spring Boot) vía HTTP usando JWT para autenticación.
 * - Funciona junto con `tokenInterceptor` y `AuthGuard` para garantizar que
 *   las solicitudes estén protegidas.
 *
 * Por qué existe dentro de la solución:
 * Centraliza toda la lógica de comunicación con el backend relacionada con órdenes,
 * evitando duplicación de código y asegurando que los componentes no gestionen
 * directamente HTTP ni tokens.
 */

export interface Order {
  id?: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  invoiceUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  // Obtener todas las órdenes
  getOrders(): Observable<Order[]> {
    const token = localStorage.getItem('token') || '';
    return this.http.get<Order[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Crear orden con archivo
  createOrder(formData: FormData): Observable<Order> {
    const token = localStorage.getItem('token') || '';
    // IMPORTANTE: No ponemos Content-Type, Angular lo gestiona
    return this.http.post<Order>(this.apiUrl, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}