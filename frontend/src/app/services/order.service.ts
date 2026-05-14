import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Order {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: string;
  invoiceUrl: string | null;
  createdBy: string;
  approvedBy: number | null;
  createdDate: string;
  approvedDate: string | null;
}

export interface OrderStatusLog {
  id: number;
  orderId: number;
  oldStatus: string;
  newStatus: string;
  changedDate: string;
  changedBy: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  // ============================
  // HEADER CON TOKEN
  // ============================
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }

  // ============================
  // MANEJO DE ERRORES
  // ============================
  private handleError(error: HttpErrorResponse) {

    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor ${error.status}: ${error.message}`;
    }

    console.error('OrderService error:', errorMessage);

    return throwError(() => errorMessage);
  }

  // ============================
  // OBTENER ÓRDENES
  // ============================
  getOrders(): Observable<Order[]> {

    return this.http
      .get<Order[]>(this.apiUrl, {
        headers: this.getHeaders()
      })
      .pipe(catchError(this.handleError));

  }

  // ============================
  // CREAR ORDEN
  // ============================
  createOrder(formData: FormData): Observable<Order> {

    return this.http
      .post<Order>(this.apiUrl, formData, {
        headers: this.getHeaders()
      })
      .pipe(catchError(this.handleError));

  }

  // ============================
  // ACTUALIZAR ESTADO
  // ============================
  updateOrderStatus(
    id: number,
    status: string,
    userId: number
  ): Observable<Order> {

    return this.http
      .put<Order>(
        `${this.apiUrl}/${id}/status`,
        null,
        {
          headers: this.getHeaders(),
          params: {
            status: status,
            userId: userId.toString()
          }
        }
      )
      .pipe(catchError(this.handleError));

  }

  // ============================
  // HISTORIAL POR ORDEN
  // ============================
  getOrderStatusLog(orderId: number): Observable<OrderStatusLog[]> {

    return this.http
      .get<OrderStatusLog[]>(
        `${this.apiUrl}/${orderId}/status-log`,
        {
          headers: this.getHeaders()
        }
      )
      .pipe(catchError(this.handleError));

  }

  // ============================
  // HISTORIAL GLOBAL
  // ============================
  getAllOrderStatusLogs(): Observable<OrderStatusLog[]> {

    return this.http
      .get<OrderStatusLog[]>(
        `${this.apiUrl}/status-log`,
        {
          headers: this.getHeaders()
        }
      )
      .pipe(catchError(this.handleError));

  }

}