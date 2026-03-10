import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-operator',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css']
})
export class OperatorComponent {

  // -------- Formulario de nueva orden --------
  order = {
    title: '',
    description: '',
    amount: 0,
    status: 'PENDIENTE',
    created_by: ''
  };

  selectedFile: File | null = null;
  currentUserEmail: string = '';

  // -------- Lista de órdenes para el modal --------
  ordersList: any[] = [];

  // -------- Modal visual --------
  isModalOpen: boolean = false;

  constructor(private orderService: OrderService, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserEmail = payload.sub;
        this.order.created_by = this.currentUserEmail;
      } catch (e) {
        console.error('No se pudo leer el token', e);
      }
    }
  }

  // ===========================
  // MANEJO DE ARCHIVOS
  // ===========================
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      alert('❌ Tipo de archivo no permitido. Solo PDF, PNG o JPG.');
      this.selectedFile = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Archivo demasiado grande. Máximo 5MB.');
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  // ===========================
  // CREAR NUEVA ORDEN
  // ===========================
  createOrder() {
    const formData = new FormData();
    formData.append('title', this.order.title);
    formData.append('description', this.order.description);
    formData.append('amount', this.order.amount.toString());
    formData.append('status', this.order.status);
    formData.append('created_by', this.order.created_by);

    if (this.selectedFile) {
      formData.append('invoice_url', this.selectedFile);
    }

    this.orderService.createOrder(formData).subscribe({
      next: () => {
        alert('✅ Orden creada correctamente');

        // Reset formulario
        this.order = {
          title: '',
          description: '',
          amount: 0,
          status: 'PENDIENTE',
          created_by: this.currentUserEmail
        };
        this.selectedFile = null;
      },
      error: (err) => this.handleHttpError(err, 'Crear orden')
    });
  }

  // ===========================
  // CARGAR ÓRDENES
  // ===========================
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // Filtramos solo las órdenes creadas por el usuario actual
        this.ordersList = data.filter(order => order.createdBy === this.currentUserEmail);
      },
      error: (err) => this.handleHttpError(err, 'Cargar órdenes')
    });
  }

  // ===========================
  // MODAL
  // ===========================
  openModal() {
    this.loadOrders();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // ===========================
  // LOGOUT
  // ===========================
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  // ===========================
  // MANEJO CENTRALIZADO DE ERRORES
  // ===========================
  private handleHttpError(err: any, context: string = '') {
    console.error(err);

    let msg = '';

    if (err.status === 0) msg = '⚠️ No hay conexión con el servidor';
    else if (err.status === 404) msg = '❌ Recurso no encontrado';
    else if (err.status === 403) msg = '🚫 No tienes permiso';
    else if (err.status === 500) msg = '⚠️ Error interno del servidor';
    else msg = `Error desconocido: ${err.error?.message || err.statusText || err}`;

    alert(context ? `${context}: ${msg}` : msg);
  }
}