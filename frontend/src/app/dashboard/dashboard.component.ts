import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order, OrderStatusLog } from '../services/order.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface OrderFilter {
  status: string;
  createdBy: string;
  approvedBy: string;
  createdDateFrom: string;
  createdDateTo: string;
}

interface OrderHistory {
  changedDate: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orders: Order[] = [];
  backendUrl = 'http://localhost:8080';

  // ── Visor de archivos ──────────────────────────────────
  pdfBlobUrl:   SafeResourceUrl | null = null;
  imageBlobUrl: string | null          = null;
  isViewerOpen  = false;
  isImageFile   = false;
  isLoadingFile = false;
  fileError:    string | null          = null;

  // ── Usuario actual ─────────────────────────────────────
  currentUserEmail = '';
  currentUserId: number | null = null;

  // ── Modal actualizar ───────────────────────────────────
  isUpdateModalOpen = false;
  selectedOrder: Order | null = null;
  newStatus = 'APROBADO';

  // ── Feedback ───────────────────────────────────────────
  successMessage = '';
  showSuccess    = false;

  // ── Filtros ────────────────────────────────────────────
  filter: OrderFilter = {
    status: '',
    createdBy: '',
    approvedBy: '',
    createdDateFrom: '',
    createdDateTo: ''
  };

  // ── Historial por orden ────────────────────────────────
  isHistoryModalOpen = false;
  historyData: OrderHistory[] = [];

  // ── Historial global ───────────────────────────────────
  isGlobalHistoryOpen = false;
  globalHistory: any[] = [];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  // ═══════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserEmail = payload.sub;
        this.currentUserId    = payload.userId;
      } catch (e) {
        console.error('No se pudo leer el token', e);
      }
    }
    this.loadOrders();
  }

  // ═══════════════════════════════════════════════════════
  // CARGAR ÓRDENES
  // ═══════════════════════════════════════════════════════
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data: Order[]) => this.orders = data,
      error: (err) => this.handleHttpError(err, 'Cargar órdenes')
    });
  }

  // ═══════════════════════════════════════════════════════
  // FILTROS
  // ═══════════════════════════════════════════════════════
  applyFilters() {
    this.orderService.getOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data.filter(o => {
          const createdDate = new Date(o.createdDate);
          const from = this.filter.createdDateFrom ? new Date(this.filter.createdDateFrom) : null;
          const to   = this.filter.createdDateTo   ? new Date(this.filter.createdDateTo)   : null;

          return (
            (!this.filter.status     || o.status.toLowerCase().includes(this.filter.status.toLowerCase())) &&
            (!this.filter.createdBy  || o.createdBy.toLowerCase().includes(this.filter.createdBy.toLowerCase())) &&
            (!this.filter.approvedBy || (o.approvedBy && o.approvedBy.toString().toLowerCase().includes(this.filter.approvedBy.toLowerCase()))) &&
            (!from || createdDate >= from) &&
            (!to   || createdDate <= to)
          );
        });
      },
      error: (err) => this.handleHttpError(err, 'Aplicar filtros')
    });
  }

  resetFilters() {
    this.filter = { status: '', createdBy: '', approvedBy: '', createdDateFrom: '', createdDateTo: '' };
    this.loadOrders();
  }

  // ═══════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  // ═══════════════════════════════════════════════════════
  // ARCHIVOS — helpers privados
  // ═══════════════════════════════════════════════════════
  private getFileName(url: string): string {
    return url.split('/').pop() || 'archivo';
  }

  private isImageExtension(fileName: string): boolean {
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
  }

  private authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
  }

  // ═══════════════════════════════════════════════════════
  // VER FACTURA  ← fix principal
  // ═══════════════════════════════════════════════════════
  openFile(url: string) {
    const fileName = this.getFileName(url);
    const fullUrl  = `${this.backendUrl}/api/files/${fileName}`;

    // Limpiar estado anterior
    this.resetViewerState();
    this.isViewerOpen  = true;
    this.isLoadingFile = true;

    fetch(fullUrl, { headers: this.authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.blob();
      })
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);

        if (this.isImageExtension(fileName)) {
          // → mostrar como <img>
          this.isImageFile  = true;
          this.imageBlobUrl = objectUrl;
        } else {
          // → mostrar en iframe (PDF, etc.)
          this.isImageFile = false;
          this.pdfBlobUrl  = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        }
        this.isLoadingFile = false;
      })
      .catch(err => {
        this.isLoadingFile = false;
        this.fileError = `No se pudo abrir el archivo: ${err.message}`;
        console.error('[openFile]', err);
      });
  }

  // ═══════════════════════════════════════════════════════
  // CERRAR VISOR
  // ═══════════════════════════════════════════════════════
  closeViewer() {
    // Liberar referencias de memoria
    if (this.imageBlobUrl) URL.revokeObjectURL(this.imageBlobUrl);
    if (this.pdfBlobUrl) {
      // SafeResourceUrl no expone la URL directamente; intentamos revocar vía cast
      try {
        const raw = (this.pdfBlobUrl as any).changingThisBreaksApplicationSecurity as string;
        if (raw?.startsWith('blob:')) URL.revokeObjectURL(raw);
      } catch {}
    }
    this.resetViewerState();
    this.isViewerOpen = false;
  }

  private resetViewerState() {
    this.pdfBlobUrl    = null;
    this.imageBlobUrl  = null;
    this.isImageFile   = false;
    this.isLoadingFile = false;
    this.fileError     = null;
  }

  // ═══════════════════════════════════════════════════════
  // DESCARGAR FACTURA
  // ═══════════════════════════════════════════════════════
  downloadFile(url: string) {
    const fileName = this.getFileName(url);
    const fullUrl  = `${this.backendUrl}/api/files/${fileName}`;

    fetch(fullUrl, { headers: this.authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.blob();
      })
      .then(blob => {
        const link    = document.createElement('a');
        link.href     = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch(err => this.handleHttpError(err, 'Descargar archivo'));
  }

  // ═══════════════════════════════════════════════════════
  // MODAL ACTUALIZAR
  // ═══════════════════════════════════════════════════════
  openUpdateModal(order: Order) {
    if (order.status !== 'PENDIENTE') {
      alert('Solo se pueden actualizar órdenes en estado PENDIENTE.');
      return;
    }
    this.selectedOrder     = order;
    this.newStatus         = 'APROBADO';  // default sensato
    this.isUpdateModalOpen = true;
  }

  closeUpdateModal() {
    this.isUpdateModalOpen = false;
    this.selectedOrder     = null;
  }

  saveStatus() {
    if (!this.selectedOrder || this.currentUserId === null) return;

    this.orderService.updateOrderStatus(this.selectedOrder.id, this.newStatus, this.currentUserId)
      .subscribe({
        next: () => {
          this.closeUpdateModal();
          this.successMessage = '✓ Estado de la orden actualizado correctamente.';
          this.showSuccess    = true;
          setTimeout(() => this.showSuccess = false, 3500);
          this.loadOrders();
        },
        error: (err) => this.handleHttpError(err, 'Actualizar estado')
      });
  }

  // ═══════════════════════════════════════════════════════
  // HISTORIAL POR ORDEN
  // ═══════════════════════════════════════════════════════
  openHistoryModal(order: Order) {
    this.selectedOrder = order;
    this.orderService.getOrderStatusLog(order.id).subscribe({
      next: (logs: OrderStatusLog[]) => {
        this.historyData = logs.map(l => ({
          changedDate: l.changedDate,
          oldStatus:   l.oldStatus,
          newStatus:   l.newStatus,
          changedBy:   l.changedBy.toString()
        }));
        this.isHistoryModalOpen = true;
      },
      error: (err) => this.handleHttpError(err, 'Cargar historial')
    });
  }

  closeHistoryModal() {
    this.isHistoryModalOpen = false;
    this.historyData        = [];
  }

  // ═══════════════════════════════════════════════════════
  // HISTORIAL GLOBAL
  // ═══════════════════════════════════════════════════════
  openGlobalHistory() {
    this.isGlobalHistoryOpen = true;
    this.orderService.getAllOrderStatusLogs().subscribe({
      next: (logs) => this.globalHistory = logs.filter(l => l.newStatus === 'APROBADO'),
      error: (err) => this.handleHttpError(err, 'Cargar historial global')
    });
  }

  closeGlobalHistory() {
    this.isGlobalHistoryOpen = false;
    this.globalHistory       = [];
  }

  // ═══════════════════════════════════════════════════════
  // MANEJO CENTRALIZADO DE ERRORES
  // ═══════════════════════════════════════════════════════
  private handleHttpError(err: any, context = '') {
    console.error(`[${context}]`, err);
    let msg: string;

    if      (err.status === 0)   msg = '⚠️ Sin conexión con el servidor.';
    else if (err.status === 401) msg = '🔒 Sesión expirada. Por favor inicia sesión de nuevo.';
    else if (err.status === 403) msg = '🚫 No tienes permiso para esta acción.';
    else if (err.status === 404) msg = '❌ Recurso no encontrado.';
    else if (err.status === 500) msg = '⚠️ Error interno del servidor.';
    else                         msg = err.error?.message || err.statusText || err.message || 'Error desconocido.';

    alert(context ? `${context}: ${msg}` : msg);
  }
}