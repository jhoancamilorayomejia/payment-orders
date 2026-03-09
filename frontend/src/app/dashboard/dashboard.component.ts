import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../services/order.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface OrderFilter {
  status: string;
  createdBy: string;
  approvedBy: string;
  createdDateFrom: string;
  createdDateTo: string;
}

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

  // -----------------------------
  // FILTROS
  // -----------------------------
  filter: OrderFilter = {
    status: '',
    createdBy: '',
    approvedBy: '',
    createdDateFrom: '',
    createdDateTo: ''
  };

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
      error: (err: any) => console.error(err)
    });
  }

  // -----------------------------
  // FILTROS
  // -----------------------------
  applyFilters() {
    this.orderService.getOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data.filter(o => {
          const createdDate = new Date(o.createdDate);
          const from = this.filter.createdDateFrom ? new Date(this.filter.createdDateFrom) : null;
          const to = this.filter.createdDateTo ? new Date(this.filter.createdDateTo) : null;

          const matchStatus = !this.filter.status || o.status.toLowerCase().includes(this.filter.status.toLowerCase());
          const matchCreatedBy = !this.filter.createdBy || o.createdBy.toString().toLowerCase().includes(this.filter.createdBy.toLowerCase());
          const matchApprovedBy = !this.filter.approvedBy || (o.approvedBy && o.approvedBy.toString().toLowerCase().includes(this.filter.approvedBy.toLowerCase()));
          const matchFrom = !from || createdDate >= from;
          const matchTo = !to || createdDate <= to;

          return matchStatus && matchCreatedBy && matchApprovedBy && matchFrom && matchTo;
        });
      },
      error: err => console.error(err)
    });
  }

  resetFilters() {
    this.filter = { status: '', createdBy: '', approvedBy: '', createdDateFrom: '', createdDateTo: '' };
    this.loadOrders();
  }

  // -----------------------------
  // FUNCIONES EXISTENTES
  // -----------------------------
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

    fetch(fullUrl, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.blob(); })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
        this.isViewerOpen = true;
      })
      .catch(err => alert(`No se pudo abrir el archivo: ${err.message}`));
  }

  downloadFile(url: string) {
    const fileName = this.getFileName(url);
    const fullUrl = `${this.backendUrl}/api/files/${fileName}`;
    const token = localStorage.getItem('token') || '';

    fetch(fullUrl, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.blob(); })
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
    if (order.status !== 'PENDIENTE') {
      alert('Solo se pueden actualizar órdenes pendientes.');
      return;
    }
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

    if (this.selectedOrder.status !== 'PENDIENTE') {
      alert('No se puede actualizar una orden que no está pendiente.');
      this.closeUpdateModal();
      return;
    }

    this.orderService.updateOrderStatus(this.selectedOrder.id, this.newStatus, this.currentUserId)
      .subscribe({
        next: () => {
          this.closeUpdateModal();
          this.successMessage = "✅ El estado de la orden se actualizó correctamente.";
          this.showSuccess = true;
          setTimeout(() => this.showSuccess = false, 3000);
          this.loadOrders();
        },
        error: (err: any) => {
          console.error(err);
          alert(`Error al actualizar la orden: ${err.error?.message || err.message}`);
        }
      });
  }

}