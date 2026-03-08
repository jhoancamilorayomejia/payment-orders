import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  invoiceUrl: string;

  createdBy: string;
  approvedBy: string;

  createdDate: string;
  approvedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    const token = localStorage.getItem('token') || '';

    return this.http.get<Order[]>(
      this.apiUrl,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  createOrder(formData: FormData): Observable<Order> {
    const token = localStorage.getItem('token') || '';

    return this.http.post<Order>(
      this.apiUrl,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // NUEVO METODO
  updateOrderStatus(id: number, status: string): Observable<any> {

    const token = localStorage.getItem('token') || '';

    return this.http.put(
      `${this.apiUrl}/${id}/status?status=${status}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

  }

}