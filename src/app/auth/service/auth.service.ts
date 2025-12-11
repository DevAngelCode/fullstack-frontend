import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoginRequest } from '../model/request/login-request';
import { RegisterRequest } from '../model/request/register-request';
import { LoginResponse } from '../model/response/login-response';
import { RegisterResponse } from '../model/response/register-response';
import { environment } from '../../../environments/environment'; // Import environment

const API_URL = environment.apiUrl + '/auth/'; // Use apiUrl from environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser: Observable<LoginResponse | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(JSON.parse(localStorage.getItem('user') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API_URL + 'login', loginRequest).pipe(
      tap(response => {
        if (response.token) { // Change from jwt to token
          localStorage.setItem('user', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  public updateCurrentUser(user: LoginResponse): void {
    this.currentUserSubject.next(user);
    // LocalStorage already updated by caller, but we can ensure consistency if we want
    // localStorage.setItem('user', JSON.stringify(user)); 
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(API_URL + 'register', registerRequest);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser?.token || null; // Change from jwt to token
  }

  isLoggedIn(): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && !!currentUser.token; // Change from jwt to token
  }

  getRoles(): string[] {
    const currentUser = this.currentUserValue;
    return currentUser?.roles || [];
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }
}
