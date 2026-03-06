import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Routes } from '@angular/router';
import { OperatorComponent } from './operator/operator.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

  { path: '', component: AppComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },

  {
    path: 'operator',
    component: OperatorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['OPERATOR'] }
  },

  { path: '**', redirectTo: '' }

];