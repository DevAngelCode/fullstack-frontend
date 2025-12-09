import { Routes } from '@angular/router';
import { LoginComponent } from './auth/page/login/login.component';
import { RegisterComponent } from './auth/page/register/register.component';
import { PaginaPrincipalComponent } from './public/pages/pagina-principal/pagina-principal.component';
import { DashboardComponent as AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { DashboardComponent as TecnicoDashboardComponent } from './tecnico/dashboard/dashboard.component';
import { authGuard } from './auth/guard/auth.guard';
import { roleGuard } from './auth/guard/role.guard';
import { publicGuard } from './auth/guard/public.guard'; // Import publicGuard
import { NotFoundComponent } from './shared/component/not-found/not-found.component'; // Import NotFoundComponent
import { ProfileComponent } from './shared/component/profile/profile.component'; // Import ProfileComponent
import { ServiciosComponent } from './public/pages/servicios/servicios.component'; // Import Public ServiciosComponent
import { DetalleServicioComponent } from './public/pages/detalle-servicio/detalle-servicio.component';
import { ServiciosComponent as AdminServiciosComponent } from './admin/servicios/servicios.component'; // Import Admin ServiciosComponent
import { SedesComponent } from './admin/sedes/sedes.component'; // Import Admin SedesComponent

export const routes: Routes = [
  { path: '', component: PaginaPrincipalComponent }, // Public home page
  { path: 'servicios', component: ServiciosComponent }, // Public services page
  { path: 'servicios/:id', component: DetalleServicioComponent }, // Public service detail page
  { path: 'auth/login', component: LoginComponent, canActivate: [publicGuard] }, // Apply publicGuard
  { path: 'auth/register', component: RegisterComponent, canActivate: [publicGuard] }, // Apply publicGuard
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'profile', component: ProfileComponent }, // Admin profile route
      { path: 'servicios', component: AdminServiciosComponent }, // Admin services route
      { path: 'sedes', component: SedesComponent }, // Admin sedes route
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  {
    path: 'cliente',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CLIENTE'] },
    children: [
      { path: '', component: PaginaPrincipalComponent }, // Client's main page is the public home
      { path: 'profile', component: ProfileComponent }, // Client profile route
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'tecnico',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_TECNICO'] },
    children: [
      { path: 'dashboard', component: TecnicoDashboardComponent },
      { path: 'profile', component: ProfileComponent }, // Tecnico profile route
      { path: '**', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', component: NotFoundComponent } // Wildcard route for any unmatched URL, renders NotFoundComponent
];
