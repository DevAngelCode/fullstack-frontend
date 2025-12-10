export interface UserManagementResponse {
    id: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    roles: string[];
    enabled: boolean;
    sedeId?: number;
    sedeNombre?: string;
    servicioIds?: number[];
    servicioNombres?: string[];
}
