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
    this.selectedFile = event.target.files[0];
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
  },
  error: (err) => {
    console.error(err);
    // Mostrar mensaje del backend
    alert(err.error);
  }
});
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}