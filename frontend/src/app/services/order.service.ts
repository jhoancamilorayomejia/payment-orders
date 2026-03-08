import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  invoiceUrl: string | null;

  createdBy: string;
  approvedBy: string | null;

  createdDate: string;
  approvedDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  // Obtener órdenes
  getOrders(): Observable<Order[]> {

    const token = localStorage.getItem('token') || '';

    return this.http.get<Order[]>(
      this.apiUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // Crear orden
  createOrder(formData: FormData): Observable<Order> {

    const token = localStorage.getItem('token') || '';

    return this.http.post<Order>(
      this.apiUrl,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  // Actualizar estado
  updateOrderStatus(id: number, status: string): Observable<Order> {

    const token = localStorage.getItem('token') || '';

    return this.http.put<Order>(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

}