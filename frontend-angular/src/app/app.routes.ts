import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { RecruiterDashboardPageComponent } from './pages/recruiter-dashboard-page/recruiter-dashboard-page.component';
import { CandidateDashboardPageComponent } from './pages/candidate-dashboard-page/candidate-dashboard-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { roleGuard } from './guards/role.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterPageComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'recruiter',
    component: RecruiterDashboardPageComponent,
    canActivate: [roleGuard],
    data: { roles: ['RECRUITER'] }
  },
  {
    path: 'candidate',
    component: CandidateDashboardPageComponent,
    canActivate: [roleGuard],
    data: { roles: ['CANDIDATE'] }
  }
];
