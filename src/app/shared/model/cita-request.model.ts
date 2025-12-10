export interface CitaRequest {
    servicioId: number;
    sedeId: number;
    tecnicoId: number;
    fecha: string; // ISO date format
    hora: string; // HH:mm format
    notas?: string;
}
