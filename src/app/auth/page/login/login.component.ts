import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../model/request/login-request';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    if (this.loginForm.valid) {
      const loginRequest: LoginRequest = this.loginForm.value;
      console.log('Frontend sending login request:', loginRequest); // Log the request
      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          console.log('Login successful', response);

          if (this.authService.hasRole('ROLE_ADMIN')) {
            this.router.navigate(['/admin/dashboard']);
          } else if (this.authService.hasRole('ROLE_TECNICO')) {
            this.router.navigate(['/tecnico/dashboard']);
          } else {
            this.router.navigate(['/']); // Navigate to home for clients/others
          }
        },
        error: (error) => {
          this.errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
          console.error('Login error', error);
        }
      });
    }
  }
}
