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
    return this.http.put<UserProfileResponse>(`${API_URL}/${id}`, profileRequest);
  }
}
