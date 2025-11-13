import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Location } from '@angular/common'; // Import Location

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const location = inject(Location); // Inject Location

  if (authService.isLoggedIn()) {
    // If already logged in, prevent navigation and show an alert
    alert('Ya has iniciado sesión. No puedes acceder a esta página.');
    // Navigate back to the previous page to "stay on the link"
    location.back(); 
    return false; // Prevent access to login/register if already logged in
  }

  return true; // Allow access to login/register if not logged in
};
