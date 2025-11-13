import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/service/auth.service';
import { LocalStorageService } from '../../../auth/service/local-storage.service';
import { UsuarioService } from '../../service/usuario.service';
import { ProfileRequest } from '../../model/profile-request'; // Corrected import path for ProfileRequest
import { UserProfileResponse } from '../../model/user-profile-response'; // Import UserProfileResponse

@Component({
  selector: 'app-shared-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userId: number | null = null;
  roles: string[] = [];
  message: string = '';
  isError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private usuarioService: UsuarioService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''], // New field, optional
      username: ['', Validators.required], // New field
      email: ['', [Validators.required, Validators.email]],
      telefono: [''] // New field, optional
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.localStorageService.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData.id;
      this.roles = userData.roles;

      if (this.userId) {
        this.usuarioService.getUserProfileById(this.userId).subscribe({
          next: (profileResponse: UserProfileResponse) => {
            this.profileForm.patchValue({
              nombre: profileResponse.nombre,
              apellido: profileResponse.apellido,
              username: profileResponse.username,
              email: profileResponse.email,
              telefono: profileResponse.telefono
            });
          },
          error: (error) => {
            this.message = 'Failed to load profile: ' + (error.error?.message || error.message);
            this.isError = true;
          }
        });
      } else {
        this.message = 'ID de usuario no encontrado en el almacenamiento local.';
        this.isError = true;
      }
    } else {
      this.message = 'Usuario no ha iniciado sesión o datos no encontrados.';
      this.isError = true;
    }
  }

  onSubmit(): void {
    this.message = '';
    this.isError = false;

    if (this.profileForm.invalid) {
      this.message = 'Por favor, complete todos los campos requeridos.';
      this.isError = true;
      return;
    }

    if (this.userId === null) {
      this.message = 'ID de usuario no encontrado. No se puede actualizar el perfil.';
      this.isError = true;
      return;
    }

    const { nombre, apellido, username, email, telefono } = this.profileForm.value;
    const updateData: ProfileRequest = { nombre, apellido, username, email, telefono };

    this.usuarioService.updateUserProfile(this.userId, updateData).subscribe({
      next: (response: UserProfileResponse) => {
        this.message = '¡Perfil actualizado exitosamente!';
        this.isError = false;
        // Update local storage with new user data
        const updatedUser = {
          ...JSON.parse(this.localStorageService.getItem('user') || '{}'),
          nombre: response.nombre,
          apellido: response.apellido,
          username: response.username,
          email: response.email,
          telefono: response.telefono
        };
        this.localStorageService.setItem('user', JSON.stringify(updatedUser));
      },
      error: (error: any) => {
        this.message = 'Error al actualizar el perfil: ' + (error.error?.message || error.message);
        this.isError = true;
      }
    });
  }
}
