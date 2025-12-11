import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaRequest } from '../model/cita-request.model';
import { CitaResponse } from '../model/cita-response.model';
import { HorarioDisponible } from '../model/horario-disponible.model';
import { ServicioResponse } from '../model/servicio-response.model';
import { SedeResponse } from '../model/sede-response.model';
import { TecnicoDisponible } from '../model/tecnico-disponible.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    // Public endpoints (no auth required)
    getServiciosPublic(): Observable<ServicioResponse[]> {
        return this.http.get<ServicioResponse[]>(`${this.apiUrl}/public/servicios`);
    }

    getSedesPublic(): Observable<SedeResponse[]> {
        return this.http.get<SedeResponse[]>(`${this.apiUrl}/public/sedes`);
    }

    getTecnicosDisponibles(sedeId: number, servicioId: number): Observable<TecnicoDisponible[]> {
        const params = new HttpParams()
            .set('sedeId', sedeId.toString())
            .set('servicioId', servicioId.toString());
        return this.http.get<TecnicoDisponible[]>(`${this.apiUrl}/public/tecnicos`, { params });
    }

    getHorariosDisponibles(sedeId: number, fecha: string): Observable<HorarioDisponible[]> {
        const params = new HttpParams()
            .set('sedeId', sedeId.toString())
            .set('fecha', fecha);
        return this.http.get<HorarioDisponible[]>(`${this.apiUrl}/public/disponibilidad`, { params });
    }

    // Authenticated endpoints
    crearCita(cita: CitaRequest): Observable<CitaResponse> {
        return this.http.post<CitaResponse>(`${this.apiUrl}/citas`, cita);
    }

    getMisCitas(): Observable<CitaResponse[]> {
        return this.http.get<CitaResponse[]>(`${this.apiUrl}/citas/mis-citas`);
    }

    getCitaById(id: number): Observable<CitaResponse> {
        return this.http.get<CitaResponse>(`${this.apiUrl}/citas/${id}`);
    }

    cancelarCita(id: number): Observable<CitaResponse> {
        return this.http.put<CitaResponse>(`${this.apiUrl}/citas/${id}/cancelar`, {});
    }

    updateEstadoCita(id: number, estado: string): Observable<CitaResponse> {
        return this.http.put<CitaResponse>(`${this.apiUrl}/citas/${id}/estado`, {}, { params: { estado } });
    }
}
