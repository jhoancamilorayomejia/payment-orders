import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orders: Order[] = [];

  backendUrl = 'http://localhost:8080';

  pdfBlobUrl: SafeResourceUrl | null = null;

  isViewerOpen: boolean = false;

  currentUserEmail: string = '';
  currentUserId: number | null = null;

  isUpdateModalOpen: boolean = false;

  selectedOrder: Order | null = null;

  newStatus: string = '';

  successMessage: string = '';
  showSuccess: boolean = false;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    if (token) {
      try {

        const payload = JSON.parse(atob(token.split('.')[1]));

        this.currentUserEmail = payload.sub;
        this.currentUserId = payload.userId;

      } catch (e) {

        console.error('No se pudo leer el token', e);

      }
    }

    this.loadOrders();
  }

  loadOrders() {

    this.orderService.getOrders().subscribe({

      next: (data: Order[]) => {
        this.orders = data;
      },

      error: (err: any) => {
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

        if (!res.ok) throw new Error(`Error ${res.status}`);

        return res.blob();

      })
      .then(blob => {

        const blobUrl = URL.createObjectURL(blob);

        this.pdfBlobUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

        this.isViewerOpen = true;

      })
      .catch(err => alert(`No se pudo abrir el archivo: ${err.message}`));

  }

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

        if (!res.ok) throw new Error(`Error ${res.status}`);

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

  closeViewer() {

    this.isViewerOpen = false;

    this.pdfBlobUrl = null;

  }

  openUpdateModal(order: Order) {

    this.selectedOrder = order;

    this.newStatus = order.status;

    this.isUpdateModalOpen = true;

  }

  closeUpdateModal() {

    this.isUpdateModalOpen = false;

    this.selectedOrder = null;

  }

  saveStatus() {

  if (!this.selectedOrder || this.currentUserId === null) return;

  this.orderService
    .updateOrderStatus(
      this.selectedOrder.id,
      this.newStatus,
      this.currentUserId
    )
    .subscribe({

      next: () => {

        this.closeUpdateModal();

        this.successMessage = "✅ El estado de la orden se actualizó correctamente.";
        this.showSuccess = true;

        setTimeout(() => {
          this.showSuccess = false;
        }, 3000);

        this.loadOrders();

      },

      error: (err: any) => {

  console.error("Error completo:", err);

  if (err.error) {
    console.error("Mensaje backend:", err.error);
  }

  if (err.status) {
    console.error("Código HTTP:", err.status);
  }

  alert(`Error al actualizar la orden: ${err.error?.message || err.message}`);

}

    });

}

}