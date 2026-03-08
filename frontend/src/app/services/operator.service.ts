import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  private apiUrl = 'http://localhost:8080/api/orders';

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