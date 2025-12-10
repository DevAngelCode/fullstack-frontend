export interface UserManagementRequest {
    username: string;
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    roles: string[]; // e.g., ["ROLE_ADMIN", "ROLE_CLIENTE", "ROLE_TECNICO"]
    sedeId?: number; // For technicians
    servicioIds?: number[]; // For technicians
    enabled?: boolean;
}
