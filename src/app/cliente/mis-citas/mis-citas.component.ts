import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CitaService } from '../../shared/service/cita.service';
import { CitaResponse } from '../../shared/model/cita-response.model';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.css'
})
export class MisCitasComponent implements OnInit {
  citas: CitaResponse[] = [];
  citasActuales: CitaResponse[] = [];
  citasPasadas: CitaResponse[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Filter state
  showingCurrent: boolean = true;

  constructor(private citaService: CitaService) { }

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas(): void {
    this.loading = true;
    this.errorMessage = '';

    this.citaService.getMisCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.filterCitas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.errorMessage = 'Error al cargar las citas';
        this.loading = false;
      }
    });
  }

  filterCitas(): void {
    const now = new Date();

    this.citasActuales = this.citas.filter(cita => {
      const citaDateTime = new Date(cita.fecha + 'T' + cita.hora);
      // Show in current if: future appointment OR today's appointment that hasn't passed yet
      // AND status is not CANCELADA or COMPLETADA
      return citaDateTime >= now && cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA';
    }).sort((a, b) => {
      const dateA = new Date(a.fecha + 'T' + a.hora);
      const dateB = new Date(b.fecha + 'T' + b.hora);
      return dateA.getTime() - dateB.getTime();
    });

    this.citasPasadas = this.citas.filter(cita => {
      const citaDateTime = new Date(cita.fecha + 'T' + cita.hora);
      // Show in history if: past appointment OR cancelled/completed regardless of date
      return citaDateTime < now || cita.estado === 'CANCELADA' || cita.estado === 'COMPLETADA';
    }).sort((a, b) => {
      const dateA = new Date(a.fecha + 'T' + a.hora);
      const dateB = new Date(b.fecha + 'T' + b.hora);
      return dateB.getTime() - dateA.getTime(); // Descending order
    });
  }

  showCurrent(): void {
    this.showingCurrent = true;
  }

  showPast(): void {
    this.showingCurrent = false;
  }

  cancelarCita(cita: CitaResponse): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      return;
    }

    this.loading = true;
    this.citaService.cancelarCita(cita.id).subscribe({
      next: (response) => {
        this.successMessage = 'Cita cancelada exitosamente';
        this.loadCitas(); // Reload to update the list
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error canceling appointment:', error);
        this.errorMessage = 'Error al cancelar la cita';
        this.loading = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-warning text-dark';
      case 'CONFIRMADA':
        return 'bg-info text-dark';
      case 'CANCELADA':
        return 'bg-danger';
      case 'COMPLETADA':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  formatDate(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(hora: string): string {
    const [hour] = hora.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  }

  canCancel(cita: CitaResponse): boolean {
    return cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA';
  }

  downloadRecibo(id: number): void {
    this.citaService.downloadRecibo(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_cita_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el recibo')
    });
  }
}
