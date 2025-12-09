import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  adminName: string = 'Administrador'; // Default name
  dashboardCards: DashboardCard[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.username) {
      this.adminName = currentUser.username;
    }

    this.dashboardCards = [
      {
        title: 'Gestionar Servicios',
        description: 'Administra la lista de servicios ofrecidos por el taller.',
        icon: 'fas fa-wrench',
        routerLink: '/admin/servicios'
      },
      {
        title: 'Gestionar Sedes',
        description: 'Administra las ubicaciones físicas del taller.',
        icon: 'fas fa-map-marker-alt',
        routerLink: '/admin/sedes'
      },
      {
        title: 'Gestionar Perfil',
        description: 'Actualiza tu información personal y credenciales de administrador.',
        icon: 'fas fa-user-cog',
        routerLink: '/admin/profile'
      }
      // Add more cards as needed
    ];
  }
}
