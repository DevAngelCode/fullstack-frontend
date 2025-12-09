import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfileResponse } from '../model/user-profile-response';
import { ProfileRequest } from '../model/profile-request';

const API_URL = environment.apiUrl + '/profile';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  getUserProfileById(id: number): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${API_URL}/${id}`);
  }

  updateUserProfile(id: number, profileRequest: ProfileRequest): Observable<UserProfileResponse> {
    const url = `${API_URL}/${id}`;
    return this.http.put<UserProfileResponse>(url, profileRequest);
  }

  changePassword(id: number, changePasswordRequest: any): Observable<void> {
    const url = `${API_URL}/${id}/change-password`;
    return this.http.put<void>(url, changePasswordRequest);
  }

  verifyPassword(id: number, password: string): Observable<boolean> {
    const url = `${API_URL}/${id}/verify-password`;
    return this.http.post<boolean>(url, { password });
  }
}
