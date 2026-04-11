import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, TwoFactorRequiredResponse, LoginDto, RegisterDto, User } from '../models';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cartService = inject(CartService);

  private readonly TOKEN_KEY = 'valkiric_token';
  private readonly USER_KEY = 'valkiric_user';
  private readonly api = environment.apiUrl;

  private _currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this._currentUser$.asObservable();

  constructor() {
    // Restore the correct cart for whoever is already logged in (e.g. page refresh)
    const user = this._currentUser$.value;
    if (user) {
      this.cartService.setUser(user.id);
    }
  }

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

  login(dto: LoginDto): Observable<AuthResponse | TwoFactorRequiredResponse> {
    return this.http.post<AuthResponse | TwoFactorRequiredResponse>(`${this.api}/auth/login`, dto).pipe(
      tap(res => {
        if ('access_token' in res) this.saveSession(res);
      })
    );
  }

  verifyTwoFactor(userId: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/2fa/verify`, { userId, code }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  enableTwoFactor(): Observable<{ twoFactorEnabled: boolean }> {
    return this.http.post<{ twoFactorEnabled: boolean }>(`${this.api}/auth/2fa/enable`, {}).pipe(
      tap(() => {
        const user = this.currentUser;
        if (user) this.refreshUser({ ...user, twoFactorEnabled: true });
      })
    );
  }

  disableTwoFactor(): Observable<{ twoFactorEnabled: boolean }> {
    return this.http.post<{ twoFactorEnabled: boolean }>(`${this.api}/auth/2fa/disable`, {}).pipe(
      tap(() => {
        const user = this.currentUser;
        if (user) this.refreshUser({ ...user, twoFactorEnabled: false });
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, dto).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    this._clearSession();
    this.router.navigate(['/']);
  }

  // Called by the error interceptor when a 401 is received mid-session
  forceLogout(): void {
    this._clearSession();
    this.router.navigate(['/login']);
  }

  private _clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.cartService.setUser(null);
    this._currentUser$.next(null);
  }

  refreshUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser$.next(user);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this._currentUser$.next(res.user);
    this.cartService.setUser(res.user.id);
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
