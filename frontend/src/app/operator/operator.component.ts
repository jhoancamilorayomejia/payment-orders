import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-operator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css']
})
export class OperatorComponent {

  order = {
    title: '',
    description: '',
    amount: 0,
    status: 'PENDIENTE',
    created_by: ''
  };

  selectedFile: File | null = null;
  currentUserEmail: string = '';

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

  onFileSelected(event: any) {

    const file: File = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo PDF, PNG o JPG.');
      this.selectedFile = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Archivo demasiado grande. Máximo 5MB.');
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

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

        alert("Orden creada correctamente");

        this.order = {
          title: '',
          description: '',
          amount: 0,
          status: 'Pendiente',
          created_by: this.currentUserEmail
        };

        this.selectedFile = null;
      },

      error: (err) => {
        console.error(err);
        alert(err.error);
      }

    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  // -------- Modal visual --------
  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}