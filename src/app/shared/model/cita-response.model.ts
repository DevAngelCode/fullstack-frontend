export interface CitaResponse {
    id: number;
    usuarioId: number;
    usuarioNombre: string;
    servicioId: number;
    servicioNombre: string;
    servicioPrecio: number;
    sedeId: number;
    sedeNombre: string;
    sedeDireccion: string;
    tecnicoId: number;
    tecnicoNombre: string;
    fecha: string;
    hora: string;
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
    notas?: string;
    fechaCreacion: string;
}
