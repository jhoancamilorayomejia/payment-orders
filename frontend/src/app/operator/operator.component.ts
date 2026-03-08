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

  order = { title: '', description: '', amount: 0, status: 'Pendiente' };
  selectedFile: File | null = null;

  constructor(private orderService: OrderService, private router: Router) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // -----------------------------
    // Validar tipo de archivo
    // -----------------------------
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo PDF, PNG o JPG.');
      this.selectedFile = null;
      return;
    }

    // -----------------------------
    // Validar tamaño máximo (5MB)
    // -----------------------------
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

    if (this.selectedFile) {
      formData.append('invoice_url', this.selectedFile);
    }

    this.orderService.createOrder(formData).subscribe({
      next: () => {
        alert("Orden creada correctamente");
        this.order = { title: '', description: '', amount: 0, status: 'Pendiente' };
        this.selectedFile = null;
      },
      error: (err) => {
        console.error(err);
        alert(err.error); // mensaje del backend
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}