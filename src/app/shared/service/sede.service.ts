import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SedeRequest } from '../model/sede-request.model';
import { SedeResponse } from '../model/sede-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SedeService {

  private apiUrl = `${environment.apiUrl}/sedes`;

  constructor(private http: HttpClient) { }

  getAllSedes(): Observable<SedeResponse[]> {
    return this.http.get<SedeResponse[]>(this.apiUrl);
  }

  getSedeById(id: number): Observable<SedeResponse> {
    return this.http.get<SedeResponse>(`${this.apiUrl}/${id}`);
  }

  createSede(sede: SedeRequest): Observable<SedeResponse> {
    return this.http.post<SedeResponse>(this.apiUrl, sede);
  }

  updateSede(id: number, sede: SedeRequest): Observable<SedeResponse> {
    return this.http.put<SedeResponse>(`${this.apiUrl}/${id}`, sede);
  }

  deleteSede(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
