import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../model/request/register-request';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  register(): void {
    if (this.registerForm.valid) {
      const registerRequest: RegisterRequest = this.registerForm.value;
      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.successMessage = 'Registro exitoso. Ahora puedes iniciar sesión.';
          this.errorMessage = '';
          console.log('Registration successful', response);
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.errorMessage = 'Error al registrar. Inténtalo de nuevo.';
          this.successMessage = '';
          console.error('Registration error', error);
        }
      });
    }
  }
}
