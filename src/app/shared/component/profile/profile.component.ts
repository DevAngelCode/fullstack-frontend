import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/service/auth.service';
import { LocalStorageService } from '../../../auth/service/local-storage.service';
import { UsuarioService } from '../../service/usuario.service';
import { ProfileRequest } from '../../model/profile-request'; // Corrected import path for ProfileRequest
import { UserProfileResponse } from '../../model/user-profile-response'; // Import UserProfileResponse
import { matchPasswordValidator } from '../../validators/match-password.validator';
import { ChangePasswordRequest } from '../../model/change-password-request.model';

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
  passwordForm: FormGroup;
  passwordMessage: string = '';
  isPasswordError: boolean = false;
  isCurrentPasswordValid: boolean = false;

  // Image properties
  selectedImageBase64: string | null = null;
  imagePreview: string | null = null;
  selectedFileError: string | null = null;
  currentFormat: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private usuarioService: UsuarioService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: matchPasswordValidator('newPassword', 'confirmPassword') });
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
            if (profileResponse.imagenBase64) {
              this.imagePreview = profileResponse.imagenBase64;
              this.selectedImageBase64 = profileResponse.imagenBase64;
            }
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

  onFileSelected(event: any): void {
    this.selectedFileError = null;
    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        this.selectedFileError = 'Solo se permiten archivos de imagen (JPEG, PNG, WEBP).';
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

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
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
    const updateData: ProfileRequest = {
      nombre,
      apellido,
      username,
      email,
      telefono,
      imagenBase64: this.selectedImageBase64 || undefined,
      tipoImagen: this.currentFormat || undefined
    };

    this.usuarioService.updateUserProfile(this.userId, updateData).subscribe({
      next: (response: UserProfileResponse) => {
        this.message = '¡Perfil actualizado exitosamente!';
        this.isError = false;
        // Update local storage with new user data
        const currentUserData = JSON.parse(this.localStorageService.getItem('user') || '{}');
        const updatedUser = {
          ...currentUserData,
          nombre: response.nombre,
          apellido: response.apellido,
          username: response.username,
          email: response.email,
          telefono: response.telefono,
          imagenBase64: response.imagenBase64, // Update image in local storage
          tipoImagen: response.tipoImagen
        };
        this.localStorageService.setItem('user', JSON.stringify(updatedUser));

        // Notify AuthService to update observable so navbar reflects changes immediately
        // We might need to expose a method in AuthService to update current value from outside
        // Or simply reloading the user from local storage in AuthService
        this.authService.updateCurrentUser(updatedUser);
      },
      error: (error: any) => {
        this.message = 'Error al actualizar el perfil: ' + (error.error?.message || error.message);
        this.isError = true;
      }
    });
  }

  onCurrentPasswordBlur(): void {
    const currentPasswordControl = this.passwordForm.get('currentPassword');
    if (currentPasswordControl?.value && this.userId) {
      this.usuarioService.verifyPassword(this.userId, currentPasswordControl.value).subscribe({
        next: (isValid) => {
          if (!isValid) {
            currentPasswordControl.setErrors({ incorrect: true });
            this.isCurrentPasswordValid = false;
          } else {
            this.isCurrentPasswordValid = true;
            // Remove 'incorrect' error if it exists
            if (currentPasswordControl.hasError('incorrect')) {
              delete currentPasswordControl.errors!['incorrect'];
              if (Object.keys(currentPasswordControl.errors!).length === 0) {
                currentPasswordControl.setErrors(null);
              }
            }
          }
        },
        error: () => {
          // If error checking (e.g. timeout), maybe set error or just ignore
        }
      });
    }
  }

  onChangePassword(): void {
    this.passwordMessage = '';
    this.isPasswordError = false;

    // Trigger blur manually just in case
    // this.onCurrentPasswordBlur(); // Removing this as it's async and might race.
    // We rely on standard submit or the user having blurred.
    // Actually, we should probably re-verify or trust the backend call on submit.

    if (this.passwordForm.invalid) {
      this.passwordMessage = 'Por favor, corrija los errores en el formulario.';
      this.isPasswordError = true;
      return;
    }

    if (this.userId === null) {
      this.passwordMessage = 'ID de usuario no encontrado.';
      this.isPasswordError = true;
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    if (currentPassword === newPassword) {
      this.passwordMessage = 'La nueva contraseña no puede ser igual a la actual.';
      this.isPasswordError = true;
      return;
    }

    const changePasswordRequest: ChangePasswordRequest = { currentPassword, newPassword };

    this.usuarioService.changePassword(this.userId, changePasswordRequest).subscribe({
      next: () => {
        this.passwordMessage = '¡Contraseña actualizada exitosamente!';
        this.isPasswordError = false;
        this.passwordForm.reset();
      },
      error: (error: any) => {
        // Try to extract the specific message from the backend response
        let errorMessage = 'Error al cambiar la contraseña';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        this.passwordMessage = errorMessage;
        this.isPasswordError = true;
      }
    });
  }
}
