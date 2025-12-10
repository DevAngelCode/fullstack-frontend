import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService } from '../../../shared/service/cita.service';
import { AuthService } from '../../../auth/service/auth.service';
import { ServicioResponse } from '../../../shared/model/servicio-response.model';
import { SedeResponse } from '../../../shared/model/sede-response.model';
import { TecnicoDisponible } from '../../../shared/model/tecnico-disponible.model';
import { HorarioDisponible } from '../../../shared/model/horario-disponible.model';
import { CitaRequest } from '../../../shared/model/cita-request.model';

@Component({
  selector: 'app-generar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generar-cita.component.html',
  styleUrl: './generar-cita.component.css'
})
export class GenerarCitaComponent implements OnInit {
  // Wizard steps
  currentStep: number = 1;
  totalSteps: number = 5; // Changed from 4 to 5

  // Data for each step
  servicios: ServicioResponse[] = [];
  sedes: SedeResponse[] = [];
  tecnicos: TecnicoDisponible[] = []; // New
  horariosDisponibles: HorarioDisponible[] = [];

  // Selected values
  selectedServicio: ServicioResponse | null = null;
  selectedSede: SedeResponse | null = null;
  selectedTecnico: TecnicoDisponible | null = null; // New
  selectedFecha: string = '';
  selectedHorario: HorarioDisponible | null = null;
  notas: string = '';

  // UI state
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Minimum date (today)
  minDate: string = '';

  constructor(
    private citaService: CitaService,
    private authService: AuthService,
    private router: Router
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadServicios();
  }

  // Load saved progress from localStorage
  private loadSavedProgress(): void {
    const savedProgress = localStorage.getItem('bookingProgress');
    if (!savedProgress) return;

    try {
      const progress = JSON.parse(savedProgress);
      console.log('Restoring saved progress:', progress);

      // Restore step
      if (progress.currentStep) {
        this.currentStep = progress.currentStep;
      }

      // Restore fecha and notas
      if (progress.selectedFecha) {
        this.selectedFecha = progress.selectedFecha;
      }
      if (progress.notas) {
        this.notas = progress.notas;
      }

      // Restore servicio (servicios should be loaded by now)
      if (progress.selectedServicioId) {
        const servicio = this.servicios.find(s => s.id === progress.selectedServicioId);
        if (servicio) {
          this.selectedServicio = servicio;

          // Now restore sede (will trigger loading sedes if needed)
          if (progress.selectedSedeId && this.currentStep >= 2) {
            this.loadSedesAndRestore(progress.selectedSedeId, progress);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
      localStorage.removeItem('bookingProgress');
    }
  }

  private loadSedesAndRestore(sedeId: number, progress: any): void {
    this.citaService.getSedesPublic().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
        const sede = sedes.find(s => s.id === sedeId);
        if (sede) {
          this.selectedSede = sede;

          // Restore tecnico if needed
          if (progress.selectedTecnicoId && this.currentStep >= 3 && this.selectedServicio) {
            this.loadTecnicosAndRestore(progress.selectedTecnicoId, progress);
          }
        }
      }
    });
  }

  private loadTecnicosAndRestore(tecnicoId: number, progress: any): void {
    if (!this.selectedSede || !this.selectedServicio) {
      console.warn('Cannot restore tecnico: sede or servicio not selected');
      return;
    }

    this.citaService.getTecnicosDisponibles(this.selectedSede.id, this.selectedServicio.id).subscribe({
      next: (tecnicos) => {
        this.tecnicos = tecnicos;
        const tecnico = tecnicos.find(t => t.id === tecnicoId);
        if (tecnico) {
          this.selectedTecnico = tecnico;

          // Restore horarios if needed
          if (this.selectedFecha && this.currentStep >= 4) {
            this.loadHorariosDisponibles();
          }
        }
      },
      error: (error) => {
        console.error('Error restoring tecnicos:', error);
      }
    });
  }

  // Save current progress to localStorage
  private saveProgress(): void {
    const progress = {
      currentStep: this.currentStep,
      selectedServicioId: this.selectedServicio?.id,
      selectedSedeId: this.selectedSede?.id,
      selectedTecnicoId: this.selectedTecnico?.id, // New
      selectedFecha: this.selectedFecha,
      selectedHorarioTecnicoId: this.selectedHorario?.tecnicoId,
      selectedHorarioHora: this.selectedHorario?.hora,
      notas: this.notas
    };
    localStorage.setItem('bookingProgress', JSON.stringify(progress));
    console.log('Progress saved:', progress);
  }

  // Load services for step 1
  loadServicios(): void {
    this.loading = true;
    this.citaService.getServiciosPublic().subscribe({
      next: (data) => {
        this.servicios = data;
        this.loading = false;
        // Load saved progress AFTER servicios are loaded
        this.loadSavedProgress();
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.errorMessage = 'Error al cargar los servicios';
        this.loading = false;
      }
    });
  }

  // Load locations for step 2
  loadSedes(): void {
    this.loading = true;
    this.citaService.getSedesPublic().subscribe({
      next: (data) => {
        this.sedes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.errorMessage = 'Error al cargar las sedes';
        this.loading = false;
      }
    });
  }

  // Load technicians for step 3 (filtered by sede and servicio)
  loadTecnicos(): void {
    if (!this.selectedSede || !this.selectedServicio) {
      return;
    }

    this.loading = true;
    this.citaService.getTecnicosDisponibles(this.selectedSede.id, this.selectedServicio.id).subscribe({
      next: (data) => {
        this.tecnicos = data;
        this.loading = false;
        if (this.tecnicos.length === 0) {
          this.errorMessage = 'No hay técnicos disponibles para este servicio en esta sede';
        }
      },
      error: (error) => {
        console.error('Error loading technicians:', error);
        this.errorMessage = 'Error al cargar los técnicos';
        this.loading = false;
      }
    });
  }

  // Load available time slots for step 4
  loadHorariosDisponibles(): void {
    if (!this.selectedSede || !this.selectedFecha) return;

    this.loading = true;
    this.citaService.getHorariosDisponibles(this.selectedSede.id, this.selectedFecha).subscribe({
      next: (data) => {
        // Filter by selected technician if one is selected
        if (this.selectedTecnico) {
          this.horariosDisponibles = data.filter(h => h.tecnicoId === this.selectedTecnico!.id);
        } else {
          this.horariosDisponibles = data;
        }

        this.loading = false;
        if (this.horariosDisponibles.length === 0) {
          this.errorMessage = 'No hay horarios disponibles para esta fecha';
        }
      },
      error: (error) => {
        console.error('Error loading available times:', error);
        this.errorMessage = 'Error al cargar los horarios disponibles';
        this.loading = false;
      }
    });
  }

  // Step navigation
  nextStep(): void {
    this.errorMessage = '';

    if (this.currentStep === 1 && this.selectedServicio) {
      this.currentStep = 2;
      this.loadSedes();
    } else if (this.currentStep === 2 && this.selectedSede) {
      this.currentStep = 3;
      this.loadTecnicos(); // Load technicians after selecting sede
    } else if (this.currentStep === 3 && this.selectedTecnico) {
      this.currentStep = 4; // Go to date/time selection
    } else if (this.currentStep === 4 && this.selectedHorario) {
      this.currentStep = 5; // Go to confirmation
    }
  }

  previousStep(): void {
    this.errorMessage = '';
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Selection methods
  selectServicio(servicio: ServicioResponse): void {
    this.selectedServicio = servicio;
    // Reset subsequent selections
    this.selectedSede = null;
    this.selectedTecnico = null;
    this.selectedFecha = '';
    this.selectedHorario = null;
    this.saveProgress();
  }

  selectSede(sede: SedeResponse): void {
    this.selectedSede = sede;
    // Reset subsequent selections
    this.selectedTecnico = null;
    this.selectedFecha = '';
    this.selectedHorario = null;
    this.saveProgress();
  }

  selectTecnico(tecnico: TecnicoDisponible): void {
    this.selectedTecnico = tecnico;
    // Reset subsequent selections
    this.selectedFecha = '';
    this.selectedHorario = null;
    this.saveProgress();
  }

  selectHorario(horario: HorarioDisponible): void {
    this.selectedHorario = horario;
    this.saveProgress();
  }

  onFechaChange(): void {
    this.selectedHorario = null;
    this.horariosDisponibles = [];
    if (this.selectedFecha) {
      this.loadHorariosDisponibles();
      this.saveProgress();
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const loggedIn = this.authService.isLoggedIn();
    console.log('Checking login status. Is logged in:', loggedIn);
    return loggedIn;
  }

  // Confirm appointment
  confirmarCita(): void {
    console.log('Confirmar cita called. Is logged in:', this.isLoggedIn());

    // Check if user is logged in
    if (!this.isLoggedIn()) {
      this.errorMessage = 'Debes iniciar sesión para confirmar tu cita';
      console.log('User not logged in, redirecting to login');
      // Save current state to localStorage for return after login
      this.saveBookingState();
      // Redirect to login
      this.router.navigate(['/auth/login']);
      return;
    }

    // Create appointment
    if (!this.selectedServicio || !this.selectedSede || !this.selectedTecnico || !this.selectedHorario) {
      this.errorMessage = 'Por favor complete todos los pasos';
      return;
    }

    const citaRequest: CitaRequest = {
      servicioId: this.selectedServicio.id,
      sedeId: this.selectedSede.id,
      tecnicoId: this.selectedTecnico.id, // Use selectedTecnico
      fecha: this.selectedFecha,
      hora: this.selectedHorario.hora,
      notas: this.notas
    };

    this.loading = true;
    this.citaService.crearCita(citaRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = '¡Cita creada exitosamente!';
        this.clearBookingState();
        localStorage.removeItem('bookingProgress'); // Clear saved progress
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
        this.errorMessage = 'Error al crear la cita. Por favor intente nuevamente.';
        this.loading = false;
      }
    });
  }

  // Save booking state to localStorage
  private saveBookingState(): void {
    const state = {
      servicioId: this.selectedServicio?.id,
      sedeId: this.selectedSede?.id,
      fecha: this.selectedFecha,
      horarioTecnicoId: this.selectedHorario?.tecnicoId,
      horarioHora: this.selectedHorario?.hora,
      notas: this.notas
    };
    localStorage.setItem('pendingBooking', JSON.stringify(state));
  }

  // Clear booking state from localStorage
  private clearBookingState(): void {
    localStorage.removeItem('pendingBooking');
  }

  // Helper method to format time
  formatTime(time: string): string {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  }
}
