import { Component, OnInit } from '@angular/core';
import { SedeService } from '../../shared/service/sede.service';
import { SedeResponse } from '../../shared/model/sede-response.model';
import { SedeRequest } from '../../shared/model/sede-request.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sedes.component.html',
  styleUrls: ['./sedes.component.css']
})
export class SedesComponent implements OnInit {
  sedes: SedeResponse[] = [];
  sedeForm: FormGroup;
  selectedSedeId: number | null = null;
  isEditing: boolean = false;
  highlightedRowId: number | null = null;
  selectedImageBase64: string | null = null;
  imagePreview: string | null = null;
  selectedFileError: string | null = null;
  currentFormat: string | null = null;

  // Pagination properties
  page = 1;
  pageSize = 5;
  collectionSize = 0;
  paginatedSedes: SedeResponse[] = [];

  constructor(private sedeService: SedeService, private fb: FormBuilder) {
    this.sedeForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSedes();
  }

  get totalPages(): number {
    return Math.ceil(this.collectionSize / this.pageSize);
  }

  loadSedes(): void {
    this.sedeService.getAllSedes().subscribe(data => {
      this.sedes = data;
      this.collectionSize = this.sedes.length;
      this.refreshSedes();
    });
  }

  refreshSedes(): void {
    this.paginatedSedes = this.sedes
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  onFileSelected(event: any): void {
    this.selectedFileError = null;

    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        this.selectedFileError = 'Solo se permiten archivos de imagen (JPEG, PNG, WEBP).';
        this.selectedImageBase64 = null;
        this.imagePreview = null;
        this.currentFormat = null;
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImageBase64 = e.target.result;
        this.imagePreview = e.target.result;
        this.currentFormat = file.type;
      };
      reader.readAsDataURL(file);
    }
  }

  saveSede(): void {
    if (this.sedeForm.invalid) {
      this.sedeForm.markAllAsTouched();
      return;
    }

    const currentSede: SedeRequest = {
      nombre: this.sedeForm.get('nombre')?.value,
      direccion: this.sedeForm.get('direccion')?.value,
      imagenBase64: this.selectedImageBase64 || '',
      tipoImagen: this.currentFormat || undefined
    };

    if (this.isEditing && this.selectedSedeId !== null) {
      this.sedeService.updateSede(this.selectedSedeId, currentSede).subscribe(response => {
        if (!response.imagenBase64 && currentSede.imagenBase64) {
          response.imagenBase64 = currentSede.imagenBase64;
        }

        const index = this.sedes.findIndex(s => s.id === response.id);
        if (index !== -1) {
          this.sedes[index] = response;
        }
        this.collectionSize = this.sedes.length;
        this.refreshSedes();
        this.resetForm();
      });
    } else {
      this.sedeService.createSede(currentSede).subscribe(response => {
        this.sedes.push(response);
        this.collectionSize = this.sedes.length;
        this.refreshSedes();
        this.resetForm();
      });
    }
  }

  editSede(sede: SedeResponse): void {
    this.sedeForm.patchValue({
      nombre: sede.nombre,
      direccion: sede.direccion
    });
    this.selectedSedeId = sede.id;
    this.isEditing = true;
    this.highlightedRowId = sede.id;
    if (sede.imagenBase64) {
      this.imagePreview = sede.imagenBase64;
      this.selectedImageBase64 = this.imagePreview;
    } else {
      this.imagePreview = null;
      this.selectedImageBase64 = null;
    }
  }

  deleteSede(id: number): void {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sede?')) {
      this.sedeService.deleteSede(id).subscribe(() => {
        this.sedes = this.sedes.filter(s => s.id !== id);
        this.collectionSize = this.sedes.length;
        this.refreshSedes();
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.sedeForm.reset({ nombre: '', direccion: '' });
    this.selectedSedeId = null;
    this.isEditing = false;
    this.highlightedRowId = null;
    this.selectedImageBase64 = null;
    this.imagePreview = null;

    const fileInput = document.getElementById('imagen') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
