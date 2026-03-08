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

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.orderService.getOrders().subscribe({
      next: (data) => {
        console.log("orders:", data);
        this.orders = data;
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  logout() {

    localStorage.removeItem('token'); // eliminar token

    this.router.navigate(['/']); // volver al login

  }

}