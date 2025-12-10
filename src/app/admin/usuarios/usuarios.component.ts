import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService } from '../../shared/service/user-management.service';
import { ServicioService } from '../../shared/service/servicio.service';
import { SedeService } from '../../shared/service/sede.service';
import { UserManagementRequest } from '../../shared/model/user-management-request.model';
import { UserManagementResponse } from '../../shared/model/user-management-response.model';
import { ServicioResponse } from '../../shared/model/servicio-response.model';
import { SedeResponse } from '../../shared/model/sede-response.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  users: UserManagementResponse[] = [];
  filteredUsers: UserManagementResponse[] = [];
  servicios: ServicioResponse[] = [];
  sedes: SedeResponse[] = [];

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Modal state
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentUser: UserManagementRequest = this.getEmptyUser();
  currentUserId?: number;

  // Filter
  roleFilter: string = 'ALL';

  constructor(
    private userService: UserManagementService,
    private servicioService: ServicioService,
    private sedeService: SedeService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadServicios();
    this.loadSedes();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Error al cargar usuarios';
        this.loading = false;
      }
    });
  }

  loadServicios(): void {
    this.servicioService.getAllServicios().subscribe({
      next: (data) => {
        this.servicios = data;
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  loadSedes(): void {
    this.sedeService.getAllSedes().subscribe({
      next: (data) => {
        this.sedes = data;
      },
      error: (error) => {
        console.error('Error loading sedes:', error);
      }
    });
  }

  applyFilter(): void {
    if (this.roleFilter === 'ALL') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.roles.includes(this.roleFilter)
      );
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentUser = this.getEmptyUser();
    this.showModal = true;
  }

  openEditModal(user: UserManagementResponse): void {
    this.isEditMode = true;
    this.currentUserId = user.id;
    this.currentUser = {
      username: user.username,
      email: user.email,
      password: '', // Don't send password for edit
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      roles: [...user.roles],
      sedeId: user.sedeId,
      servicioIds: user.servicioIds ? [...user.servicioIds] : [],
      enabled: user.enabled
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = this.getEmptyUser();
    this.currentUserId = undefined;
    this.errorMessage = '';
  }

  saveUser(): void {
    // Validation
    if (!this.currentUser.username || !this.currentUser.email || !this.currentUser.nombre || !this.currentUser.apellido) {
      this.errorMessage = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (!this.isEditMode && !this.currentUser.password) {
      this.errorMessage = 'La contraseña es requerida';
      return;
    }

    if (!this.currentUser.roles || this.currentUser.roles.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un rol';
      return;
    }

    // If technician, validate sede
    if (this.currentUser.roles.includes('ROLE_TECNICO') && !this.currentUser.sedeId) {
      this.errorMessage = 'Los técnicos deben tener una sede asignada';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request = this.isEditMode ?
      this.userService.updateUser(this.currentUserId!, this.currentUser) :
      this.userService.createUser(this.currentUser);

    request.subscribe({
      next: (response) => {
        this.successMessage = this.isEditMode ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
        this.loadUsers();
        this.closeModal();
        this.loading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error saving user:', error);
        this.errorMessage = error.error?.message || 'Error al guardar usuario';
        this.loading = false;
      }
    });
  }

  deleteUser(user: UserManagementResponse): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.username}?`)) {
      return;
    }

    this.loading = true;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage = 'Usuario eliminado exitosamente';
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.errorMessage = error.error?.message || 'Error al eliminar usuario';
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  toggleRole(role: string): void {
    const index = this.currentUser.roles.indexOf(role);
    if (index > -1) {
      this.currentUser.roles.splice(index, 1);
    } else {
      this.currentUser.roles.push(role);
    }
  }

  hasRole(role: string): boolean {
    return this.currentUser.roles.includes(role);
  }

  isTechnician(): boolean {
    return this.currentUser.roles.includes('ROLE_TECNICO');
  }

  toggleServicio(servicioId: number): void {
    if (!this.currentUser.servicioIds) {
      this.currentUser.servicioIds = [];
    }
    const index = this.currentUser.servicioIds.indexOf(servicioId);
    if (index > -1) {
      this.currentUser.servicioIds.splice(index, 1);
    } else {
      this.currentUser.servicioIds.push(servicioId);
    }
  }

  hasServicio(servicioId: number): boolean {
    return this.currentUser.servicioIds?.includes(servicioId) || false;
  }

  getRoleBadgeClass(roles: string[]): string {
    if (roles.includes('ROLE_ADMIN')) return 'bg-danger';
    if (roles.includes('ROLE_TECNICO')) return 'bg-primary';
    return 'bg-success';
  }

  getRoleDisplay(roles: string[]): string {
    return roles.map(role => role.replace('ROLE_', '')).join(', ');
  }

  private getEmptyUser(): UserManagementRequest {
    return {
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      telefono: '',
      roles: [],
      servicioIds: [],
      enabled: true
    };
  }
}
