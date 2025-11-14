import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServicioRequest } from '../model/servicio-request.model';
import { ServicioResponse } from '../model/servicio-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  private apiUrl = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) { }

  getAllServicios(): Observable<ServicioResponse[]> {
    return this.http.get<ServicioResponse[]>(this.apiUrl);
  }

  getServicioById(id: number): Observable<ServicioResponse> {
    return this.http.get<ServicioResponse>(`${this.apiUrl}/${id}`);
  }

  createServicio(servicio: ServicioRequest): Observable<ServicioResponse> {
    return this.http.post<ServicioResponse>(this.apiUrl, servicio);
  }

  updateServicio(id: number, servicio: ServicioRequest): Observable<ServicioResponse> {
    return this.http.put<ServicioResponse>(`${this.apiUrl}/${id}`, servicio);
  }

  deleteServicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
