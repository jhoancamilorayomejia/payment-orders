import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: AppComponent }, // Login
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];