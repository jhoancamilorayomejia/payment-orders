import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  invoice_url: string;
  created_by: string;
  approved_by: string;
  created_date: string;
  approved_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private api = "http://localhost:8080/api/orders";

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.api);
  }
}