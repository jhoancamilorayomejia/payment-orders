import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orders: Order[] = [];
  backendUrl = 'http://localhost:8080'; // URL base del backend

  pdfBlobUrl: string | null = null; // URL temporal del archivo
  isViewerOpen: boolean = false;    // controla si se muestra el modal

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  getFileName(url: string): string {
    return url.split('/').pop() || 'archivo';
  }

  // Abrir archivo dentro de la app (modal)
  openFile(url: string) {
    const fileName = this.getFileName(url);
    const fullUrl = `${this.backendUrl}/api/files/${fileName}`;
    const token = localStorage.getItem('token') || '';

    fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.blob();
      })
      .then(blob => {
        this.pdfBlobUrl = URL.createObjectURL(blob); // URL temporal
        this.isViewerOpen = true;                    // abrir modal
      })
      .catch(err => alert(`No se pudo abrir el archivo: ${err.message}`));
  }

  // Descargar archivo
  downloadFile(url: string) {
    const fileName = this.getFileName(url);
    const fullUrl = `${this.backendUrl}/api/files/${fileName}`;
    const token = localStorage.getItem('token') || '';

    fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      })
      .catch(err => alert(`No se pudo descargar el archivo: ${err.message}`));
  }

  // Cerrar visor
  closeViewer() {
    this.isViewerOpen = false;
    if (this.pdfBlobUrl) {
      URL.revokeObjectURL(this.pdfBlobUrl);
      this.pdfBlobUrl = null;
    }
  }
}