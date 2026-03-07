import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../services/order.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

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

}