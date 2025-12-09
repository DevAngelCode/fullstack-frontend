import { Component, OnInit } from '@angular/core';
import { ServicioService } from '../../shared/service/servicio.service';
import { ServicioResponse } from '../../shared/model/servicio-response.model';
import { ServicioRequest } from '../../shared/model/servicio-request.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillEditorComponent],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {
  servicios: ServicioResponse[] = [];
  servicioForm: FormGroup;
  selectedServicioId: number | null = null;
  isEditing: boolean = false;
  highlightedRowId: number | null = null; // New property for highlighting
  selectedImageBase64: string | null = null; // For holding the base64 string
  imagePreview: string | null = null; // For displaying preview
  selectedFileError: string | null = null; // Property for file error message
  currentFormat: string | null = null; // For displaying preview

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

  onFileSelected(event: any): void {
    this.selectedFileError = null; // Reset error

    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        this.selectedFileError = 'Solo se permiten archivos de imagen (JPEG, PNG, WEBP).';
        this.selectedImageBase64 = null;
        this.imagePreview = null;
        this.currentFormat = null;
        event.target.value = ''; // Reset file input
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImageBase64 = e.target.result;
        this.imagePreview = e.target.result;
        this.currentFormat = file.type; // Save mime type
      };
      reader.readAsDataURL(file);
    }
  }

  saveServicio(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const currentServicio: ServicioRequest = {
      nombre: this.servicioForm.get('nombre')?.value,
      descripcion: this.servicioForm.get('descripcion')?.value,
      precio: this.servicioForm.get('precio')?.value,
      imagenBase64: this.selectedImageBase64 || '',
      tipoImagen: this.currentFormat || undefined
    };

    if (this.isEditing && this.selectedServicioId !== null) {
      this.servicioService.updateServicio(this.selectedServicioId, currentServicio).subscribe(response => {
        // Fix: If backend returned null image (because it wasn't updated), preserve the one we sent or had.
        if (!response.imagenBase64 && currentServicio.imagenBase64) {
          response.imagenBase64 = currentServicio.imagenBase64;
        }

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
    if (servicio.imagenBase64) {
      this.imagePreview = servicio.imagenBase64;
      this.selectedImageBase64 = this.imagePreview;
    } else {
      this.imagePreview = null;
      this.selectedImageBase64 = null;
    }
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
    this.selectedImageBase64 = null;
    this.imagePreview = null;

    // Reset file input if possible, but standard way is enough
    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
