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
  approvedBy: number | null; // CAMBIO: ahora es number
  createdDate: string;
  approvedDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    const token = localStorage.getItem('token') || '';
    return this.http.get<Order[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  createOrder(formData: FormData): Observable<Order> {
    const token = localStorage.getItem('token') || '';
    return this.http.post<Order>(this.apiUrl, formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateOrderStatus(id: number, status: string, userId: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status`, null, {
      params: {
        status: status,
        userId: userId.toString()
      }
    });
  }
}