import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'valkiric_token';
  private readonly USER_KEY = 'valkiric_user';
  private readonly api = environment.apiUrl;

  private _currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this._currentUser$.asObservable();

  get currentUser(): User | null {
    return this._currentUser$.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser$.next(null);
    this.router.navigate(['/']);
  }

  refreshUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser$.next(user);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this._currentUser$.next(res.user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
