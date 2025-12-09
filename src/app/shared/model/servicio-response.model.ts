export interface ServicioResponse {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenBase64: string;
    tipoImagen?: string;
}
