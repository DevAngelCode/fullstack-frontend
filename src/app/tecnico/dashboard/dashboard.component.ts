import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for *ngIf, *ngFor
import { RouterModule } from '@angular/router'; // Import RouterModule
import { CitaService } from '../../shared/service/cita.service';
import { CitaResponse } from '../../shared/model/cita-response.model';
import { AuthService } from '../../auth/service/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  citas: CitaResponse[] = [];
  loading: boolean = true;
  stats = {
    total: 0,
    pendientes: 0,
    completadas: 0
  };

  constructor(private citaService: CitaService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.citaService.getMisCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.citas.length;
    this.stats.pendientes = this.citas.filter(c => c.estado === 'PENDIENTE').length;
    this.stats.completadas = this.citas.filter(c => c.estado === 'COMPLETADA').length;
  }
}
