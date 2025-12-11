import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitaService } from '../../shared/service/cita.service';
import { CitaResponse } from '../../shared/model/cita-response.model';

@Component({
  selector: 'app-gestionar-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-citas.component.html',
  styleUrl: './gestionar-citas.component.css'
})
export class GestionarCitasComponent implements OnInit {
  citas: CitaResponse[] = [];
  filteredCitas: CitaResponse[] = [];
  loading: boolean = true;

  // Filters
  filterEstado: string = '';
  filterFecha: string = '';
  filterNombre: string = '';

  // Modal
  selectedCita: CitaResponse | null = null;

  constructor(private citaService: CitaService) { }

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas(): void {
    this.loading = true;
    this.citaService.getMisCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading citas', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCitas = this.citas.filter(cita => {
      const matchEstado = this.filterEstado ? cita.estado === this.filterEstado : true;
      const matchFecha = this.filterFecha ? cita.fecha.toString() === this.filterFecha : true;
      const matchNombre = this.filterNombre ?
        cita.usuarioNombre.toLowerCase().includes(this.filterNombre.toLowerCase()) ||
        cita.id.toString().includes(this.filterNombre) : true;
      return matchEstado && matchFecha && matchNombre;
    });
  }

  clearFilters(): void {
    this.filterEstado = '';
    this.filterFecha = '';
    this.filterNombre = '';
    this.applyFilters();
  }

  cambiarEstado(id: number, nuevoEstado: string): void {
    if (!confirm(`¿Estás seguro de marcar esta cita como ${nuevoEstado}?`)) return;

    this.citaService.updateEstadoCita(id, nuevoEstado).subscribe({
      next: (updatedCita) => {
        const index = this.citas.findIndex(c => c.id === id);
        if (index !== -1) {
          this.citas[index] = updatedCita;
          this.applyFilters();
          // Update modal if open
          if (this.selectedCita && this.selectedCita.id === id) {
            this.selectedCita = updatedCita;
          }
        }
      },
      error: (err) => alert('Error al actualizar estado')
    });
  }

  openDetalle(cita: CitaResponse): void {
    this.selectedCita = cita;
  }

  closeDetalle(): void {
    this.selectedCita = null;
  }

  getStatusBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge bg-warning text-dark';
      case 'COMPLETADA': return 'badge bg-success';
      case 'CANCELADA': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
