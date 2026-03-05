import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private http: HttpClient) {}

  login() {
  const body = {
    email: this.email,
    password: this.password
  };

  this.http.post('http://localhost:8080/api/auth/login', body, { responseType: 'text' })
    .subscribe({
      next: (res) => this.message = res,
      error: () => this.message = 'Credenciales incorrectas'
    });
}
}