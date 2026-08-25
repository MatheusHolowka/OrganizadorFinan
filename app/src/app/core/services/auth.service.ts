import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models';

export interface RegisterResponse {
  message: string;
  email: string;
  requiresEmailVerification?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/api/auth';

  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  readonly currentUser = computed(() => this._currentUser());
  readonly isAuthenticated = computed(() => !!this._currentUser() && !!this._token());

  constructor() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          this._token.set(storedToken);
          this._currentUser.set(JSON.parse(storedUser));
        } catch {
          this.logout();
        }
      }
    }
  }

  register(data: { name: string; email: string; password: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  verifyEmail(data: { email?: string; code?: string; token?: string }): Observable<AuthResponse & { message: string }> {
    return this.http.post<AuthResponse & { message: string }>(`${this.apiUrl}/verify-email`, data).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/resend-verification`, { email });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: { token: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, data);
  }

  updateCurrentUser(user: User) {
    this._currentUser.set(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  logout() {
    this._token.set(null);
    this._currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private setSession(authResult: AuthResponse) {
    this._token.set(authResult.token);
    this._currentUser.set(authResult.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authResult.token);
      localStorage.setItem('user', JSON.stringify(authResult.user));
    }
  }
}
