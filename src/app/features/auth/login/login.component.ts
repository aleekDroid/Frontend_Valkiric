import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-logo">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,28 16,22 2,28" fill="#C0392B"/>
            <polygon points="16,22 2,28 16,28 30,28" fill="#A93226" opacity="0.6"/>
          </svg>
          <h1>VALKIRIC</h1>
        </div>

        @if (step() === 'login') {
          <h2>Iniciar Sesión</h2>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input formControlName="email" type="email" class="form-control" placeholder="tu@email.com"
                [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="form-error">Email inválido</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input formControlName="password" [type]="showPwd() ? 'text' : 'password'" class="form-control" placeholder="••••••••"
                [class.is-invalid]="form.get('password')?.invalid && form.get('password')?.touched" />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <span class="form-error">Contraseña requerida</span>
              }
            </div>

            @if (error()) {
              <div class="auth-error">{{ error() }}</div>
            }

            <button type="submit" class="btn btn-primary btn-lg auth-btn" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <span class="spinner"></span> Ingresando...
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>
          <p class="auth-footer">
            ¿No tienes cuenta? <a routerLink="/register">Regístrate</a>
          </p>
          <p class="demo-hint">
            Demo: <code>admin&#64;valkiric.com</code> / <code>Admin1234!</code>
          </p>
        }

        @if (step() === 'otp') {
          <h2>Verificación en 2 Pasos</h2>
          <p class="otp-hint">Enviamos un código de 6 dígitos a tu correo. Ingrésalo a continuación. Expira en 10 minutos.</p>
          <form [formGroup]="otpForm" (ngSubmit)="submitOtp()">
            <div class="form-group">
              <label class="form-label">Código de verificación</label>
              <input formControlName="code" type="text" inputmode="numeric" maxlength="6"
                class="form-control otp-input" placeholder="000000"
                [class.is-invalid]="otpForm.get('code')?.invalid && otpForm.get('code')?.touched" />
              @if (otpForm.get('code')?.invalid && otpForm.get('code')?.touched) {
                <span class="form-error">El código debe tener 6 dígitos</span>
              }
            </div>

            @if (error()) {
              <div class="auth-error">{{ error() }}</div>
            }

            <button type="submit" class="btn btn-primary btn-lg auth-btn" [disabled]="otpForm.invalid || loading()">
              @if (loading()) {
                <span class="spinner"></span> Verificando...
              } @else {
                Verificar Código
              }
            </button>
          </form>
          <p class="auth-footer">
            <a href="#" (click)="backToLogin($event)">← Volver al inicio de sesión</a>
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - var(--header-h));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 16px;
      background: radial-gradient(ellipse at 50% 0%, rgba(192,57,43,.08) 0%, transparent 60%);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
      justify-content: center;

      h1 {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 900;
        letter-spacing: 0.15em;
      }
    }

    h2 {
      font-family: var(--font-display);
      font-size: 1.3rem;
      margin-bottom: 24px;
      text-align: center;
    }

    .auth-btn {
      width: 100%;
      justify-content: center;
      margin-top: 8px;
    }

    .auth-error {
      background: rgba(192,57,43,.1);
      border: 1px solid rgba(192,57,43,.3);
      color: var(--color-danger);
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      margin-bottom: 12px;
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.875rem;
      color: var(--color-text-muted);

      a { color: var(--color-primary); &:hover { text-decoration: underline; } }
    }

    .demo-hint {
      text-align: center;
      margin-top: 12px;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      background: var(--color-surface-2);
      padding: 8px 12px;
      border-radius: var(--radius-sm);

      code {
        background: var(--color-border);
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 0.75rem;
      }
    }

    .otp-hint {
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.875rem;
      margin-bottom: 24px;
    }

    .otp-input {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.4em;
      font-family: monospace;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notif = inject(NotificationService);

  step = signal<'login' | 'otp'>('login');
  pendingUserId = signal('');
  loading = signal(false);
  error = signal('');
  showPwd = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        this.loading.set(false);
        if ('twoFactorRequired' in res && res.twoFactorRequired) {
          this.pendingUserId.set(res.userId);
          this.step.set('otp');
        } else if ('user' in res) {
          this.notif.success(`¡Bienvenido, ${res.user.name}!`);
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Credenciales incorrectas');
      }
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const code = this.otpForm.value.code!;
    this.auth.verifyTwoFactor(this.pendingUserId(), code).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notif.success(`¡Bienvenido, ${res.user.name}!`);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Código incorrecto o expirado');
      }
    });
  }

  backToLogin(e: Event): void {
    e.preventDefault();
    this.step.set('login');
    this.pendingUserId.set('');
    this.otpForm.reset();
    this.error.set('');
  }
}
