import { Component, inject } from '@angular/core'; // Add inject
import { Router, RouterLink } from '@angular/router'; // Import Router and RouterLink
import { AuthService } from '../../../auth/service/auth.service'; // Import AuthService

@Component({
  selector: 'app-not-found',
  imports: [], // Add RouterLink
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  goToDashboard(): void {
    if (this.authService.isLoggedIn()) {
      const userRoles = this.authService.getRoles();
      let defaultRoute = '/'; // Default to home page

      if (userRoles.includes('ROLE_ADMIN')) {
        defaultRoute = '/admin/dashboard';
      } else if (userRoles.includes('ROLE_TECNICO')) {
        defaultRoute = '/tecnico/dashboard';
      } else if (userRoles.includes('ROLE_CLIENTE')) {
        defaultRoute = '/'; // Client dashboard is the root path
      }
      this.router.navigate([defaultRoute]);
    } else {
      this.router.navigate(['/auth/login']); // If not logged in, go to login
    }
  }
}
