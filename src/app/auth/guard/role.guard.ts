import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Location } from '@angular/common'; // Import Location


export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const location = inject(Location); // Inject Location


  const expectedRoles = route.data['roles'] as string[];

  if (authService.isLoggedIn() && expectedRoles) {
    const userRoles = authService.getRoles();
    for (const role of expectedRoles) {
      if (userRoles.includes(role)) {
        return true;
      }
    }
  }

  
  // If logged in but doesn't have required role, prevent navigation (stay on current route)
  alert('Acceso denegado: No tienes los permisos necesarios para acceder a esta página.'); // Show alert
   location.back();

  return false;
};
