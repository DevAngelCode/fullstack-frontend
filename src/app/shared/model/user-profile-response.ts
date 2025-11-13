export interface UserProfileResponse {
    id: number;
    nombre: string;
    apellido: string; // New field
    username: string;
    email: string;
    telefono: string; // New field
    roles: string[];
    enabled: boolean;
}
