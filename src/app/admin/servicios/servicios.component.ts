import { Component, OnInit } from '@angular/core';
import { ServicioService } from '../../shared/service/servicio.service';
import { ServicioResponse } from '../../shared/model/servicio-response.model';
import { ServicioRequest } from '../../shared/model/servicio-request.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {
  servicios: ServicioResponse[] = [];
  servicioForm: FormGroup;
  selectedServicioId: number | null = null;
  isEditing: boolean = false;
  highlightedRowId: number | null = null; // New property for highlighting

  // Pagination properties
  page = 1;
  pageSize = 5; // Number of items per page
  collectionSize = 0; // Total number of items
  paginatedServicios: ServicioResponse[] = [];

  constructor(private servicioService: ServicioService, private fb: FormBuilder) {
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadServicios();
  }

  get totalPages(): number {
    return Math.ceil(this.collectionSize / this.pageSize);
  }

  loadServicios(): void {
    this.servicioService.getAllServicios().subscribe(data => {
      this.servicios = data;
      this.collectionSize = this.servicios.length;
      this.refreshServicios();
    });
  }

  refreshServicios(): void {
    this.paginatedServicios = this.servicios
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  saveServicio(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const currentServicio: ServicioRequest = this.servicioForm.value;

    if (this.isEditing && this.selectedServicioId !== null) {
      this.servicioService.updateServicio(this.selectedServicioId, currentServicio).subscribe(response => {
        const index = this.servicios.findIndex(s => s.id === response.id);
        if (index !== -1) {
          this.servicios[index] = response;
        }
        this.collectionSize = this.servicios.length;
        this.refreshServicios();
        this.resetForm();
      });
    } else {
      this.servicioService.createServicio(currentServicio).subscribe(response => {
        this.servicios.push(response);
        this.collectionSize = this.servicios.length;
        this.refreshServicios();
        this.resetForm();
      });
    }
  }

  editServicio(servicio: ServicioResponse): void {
    this.servicioForm.patchValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio
    });
    this.selectedServicioId = servicio.id;
    this.isEditing = true;
    this.highlightedRowId = servicio.id; // Highlight the row
  }

  deleteServicio(id: number): void {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      this.servicioService.deleteServicio(id).subscribe(() => {
        this.servicios = this.servicios.filter(s => s.id !== id);
        this.collectionSize = this.servicios.length;
        this.refreshServicios();
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.servicioForm.reset({ nombre: '', descripcion: '', precio: 0 });
    this.selectedServicioId = null;
    this.isEditing = false;
    this.highlightedRowId = null; // Clear highlight
  }
}
