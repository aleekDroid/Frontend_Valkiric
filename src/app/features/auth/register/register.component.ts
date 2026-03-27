import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

function passwordMatch(control: AbstractControl) {
  const pwd = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pwd === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
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
        <h2>Crear Cuenta</h2>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">Nombre completo</label>
            <input formControlName="name" class="form-control" placeholder="Juan García"
              [class.is-invalid]="f('name')?.invalid && f('name')?.touched" />
            @if (f('name')?.invalid && f('name')?.touched) {
              <span class="form-error">Nombre requerido (mín. 2 caracteres)</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input formControlName="email" type="email" class="form-control" placeholder="tu@email.com"
              [class.is-invalid]="f('email')?.invalid && f('email')?.touched" />
            @if (f('email')?.invalid && f('email')?.touched) {
              <span class="form-error">Email inválido</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label">Contraseña</label>
            <input formControlName="password" type="password" class="form-control" placeholder="Mín. 8 caracteres"
              [class.is-invalid]="f('password')?.invalid && f('password')?.touched" />
            @if (f('password')?.invalid && f('password')?.touched) {
              <span class="form-error">Mín. 8 caracteres, una mayúscula y un número</span>
            }
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar Contraseña</label>
            <input formControlName="confirmPassword" type="password" class="form-control" placeholder="Repite tu contraseña"
              [class.is-invalid]="(form.errors?.['mismatch'] || f('confirmPassword')?.invalid) && f('confirmPassword')?.touched" />
            @if (form.errors?.['mismatch'] && f('confirmPassword')?.touched) {
              <span class="form-error">Las contraseñas no coinciden</span>
            }
          </div>

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary btn-lg auth-btn" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span class="spinner"></span> Creando cuenta...
            } @else {
              Crear Cuenta
            }
          </button>
        </form>

        <p class="auth-footer">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
        </p>
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
    .auth-card { width: 100%; max-width: 420px; padding: 40px; }
    .auth-logo {
      display: flex; align-items: center; gap: 12px; margin-bottom: 28px; justify-content: center;
      h1 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 900; letter-spacing: 0.15em; }
    }
    h2 { font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 24px; text-align: center; }
    .auth-btn { width: 100%; justify-content: center; margin-top: 8px; }
    .auth-error {
      background: rgba(192,57,43,.1); border: 1px solid rgba(192,57,43,.3);
      color: var(--color-danger); padding: 10px 14px; border-radius: var(--radius-sm);
      font-size: 0.875rem; margin-bottom: 12px;
    }
    .auth-footer {
      text-align: center; margin-top: 20px; font-size: 0.875rem; color: var(--color-text-muted);
      a { color: var(--color-primary); &:hover { text-decoration: underline; } }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notif = inject(NotificationService);

  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  f(name: string) { return this.form.get(name); }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { name, email, password } = this.form.value;
    this.auth.register({ name: name!, email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notif.success(`¡Bienvenido a Valkiric, ${res.user.name}!`);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al crear la cuenta');
      }
    });
  }
}
