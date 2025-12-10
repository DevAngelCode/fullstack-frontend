import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserManagementRequest } from '../model/user-management-request.model';
import { UserManagementResponse } from '../model/user-management-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private apiUrl = `${environment.apiUrl}/admin/users`;

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<UserManagementResponse[]> {
        return this.http.get<UserManagementResponse[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<UserManagementResponse> {
        return this.http.get<UserManagementResponse>(`${this.apiUrl}/${id}`);
    }

    createUser(user: UserManagementRequest): Observable<UserManagementResponse> {
        return this.http.post<UserManagementResponse>(this.apiUrl, user);
    }

    updateUser(id: number, user: UserManagementRequest): Observable<UserManagementResponse> {
        return this.http.put<UserManagementResponse>(`${this.apiUrl}/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
