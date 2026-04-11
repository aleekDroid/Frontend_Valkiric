import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { Order } from '../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px;max-width:860px">
      <div class="page-header">
        <h1>Mi Perfil</h1>
        <p>{{ auth.currentUser?.email }}</p>
      </div>

      <div class="profile-layout">
        <!-- Edit Profile -->
        <div class="card">
          <h3 class="section-title">Información Personal</h3>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input formControlName="name" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input formControlName="phone" class="form-control" placeholder="+52 000 000 0000" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input [value]="auth.currentUser?.email" class="form-control" disabled />
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="profileLoading()">
              @if (profileLoading()) { <span class="spinner"></span> } Guardar Cambios
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <h3 class="section-title">Cambiar Contraseña</h3>
          <form [formGroup]="pwdForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label class="form-label">Contraseña Actual</label>
              <input formControlName="currentPassword" type="password" class="form-control"
                [class.is-invalid]="pf('currentPassword')?.invalid && pf('currentPassword')?.touched" />
            </div>
            <div class="form-group">
              <label class="form-label">Nueva Contraseña</label>
              <input formControlName="newPassword" type="password" class="form-control"
                [class.is-invalid]="pf('newPassword')?.invalid && pf('newPassword')?.touched" />
              @if (pf('newPassword')?.invalid && pf('newPassword')?.touched) {
                <span class="form-error">Mín. 8 caracteres, una mayúscula y un número</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar Nueva Contraseña</label>
              <input formControlName="confirmNew" type="password" class="form-control" />
              @if (pwdForm.errors?.['mismatch'] && pf('confirmNew')?.touched) {
                <span class="form-error">Las contraseñas no coinciden</span>
              }
            </div>
            <button type="submit" class="btn btn-outline" [disabled]="pwdForm.invalid || pwdLoading()">
              @if (pwdLoading()) { <span class="spinner"></span> } Cambiar Contraseña
            </button>
          </form>
        </div>

        <!-- Two-Factor Auth -->
        <div class="card full-width">
          <h3 class="section-title">Verificación en 2 Pasos (2FA)</h3>
          <div class="twofa-row">
            <div>
              <p style="margin:0 0 4px;font-weight:500;">
                Estado: 
                @if (auth.currentUser?.twoFactorEnabled) {
                  <span style="color:var(--color-success, #2ecc71)">Activada ✓</span>
                } @else {
                  <span style="color:var(--color-text-muted)">Desactivada</span>
                }
              </p>
              <p style="margin:0;font-size:0.8rem;color:var(--color-text-muted)">
                Al iniciar sesión se enviará un código de verificación a tu correo.
              </p>
            </div>
            @if (auth.currentUser?.twoFactorEnabled) {
              <button class="btn btn-outline btn-sm" [disabled]="twofaLoading()" (click)="toggleTwoFactor(false)">
                @if (twofaLoading()) { <span class="spinner"></span> } Desactivar
              </button>
            } @else {
              <button class="btn btn-primary btn-sm" [disabled]="twofaLoading()" (click)="toggleTwoFactor(true)">
                @if (twofaLoading()) { <span class="spinner"></span> } Activar
              </button>
            }
          </div>
        </div>

        <!-- Orders -->
        <div id="orders" class="card full-width">
          <h3 class="section-title">Mis Pedidos</h3>
          @if (ordersLoading()) {
            <p style="color:var(--color-text-muted)">Cargando pedidos...</p>
          } @else if (orders().length === 0) {
            <div class="empty-state" style="padding:40px">
              <div class="empty-icon">📦</div>
              <h3>Sin pedidos</h3>
              <p>Aún no has realizado ningún pedido.</p>
              <a routerLink="/catalog" class="btn btn-primary" style="margin-top:12px">Ver Catálogo</a>
            </div>
          } @else {
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Artículos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of orders(); track order.id) {
                    <tr>
                      <td><code style="font-size:0.8rem">{{ order.paymentReference || order.id.slice(0,8) }}</code></td>
                      <td>{{ order.items.length }} artículo{{ order.items.length !== 1 ? 's' : '' }}</td>
                      <td><strong>\${{ order.total | number:'1.2-2' }}</strong></td>
                      <td><span class="badge" [class]="statusBadge(order.status)">{{ order.status }}</span></td>
                      <td>{{ order.createdAt | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .full-width { grid-column: 1 / -1; }

    .section-title {
      font-family: var(--font-display);
      font-size: 1rem;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .twofa-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    @media (max-width: 640px) {
      .profile-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  orders = signal<Order[]>([]);
  ordersLoading = signal(true);
  profileLoading = signal(false);
  pwdLoading = signal(false);
  twofaLoading = signal(false);

  profileForm = this.fb.group({
    name: [this.auth.currentUser?.name || '', Validators.required],
    phone: [this.auth.currentUser?.phone || '']
  });

  pwdForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmNew: ['', Validators.required]
  }, {
    validators: (g) => {
      return g.get('newPassword')?.value === g.get('confirmNew')?.value ? null : { mismatch: true };
    }
  });

  pf(name: string) { return this.pwdForm.get(name); }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      paid: 'badge-success', delivered: 'badge-success', shipped: 'badge-info',
      processing: 'badge-warning', pending: 'badge-warning', cancelled: 'badge-danger'
    };
    return map[status] || 'badge-muted';
  }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn() || !this.auth.currentUser) {
      this.ordersLoading.set(false);
      return;
    }
    this.orderService.myOrders().subscribe({
      next: (o) => { this.orders.set(o); this.ordersLoading.set(false); },
      error: () => {
        this.ordersLoading.set(false);
        // Nota: si entra aquí con 401, el interceptor hace logout, por eso se ve el redirect
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileLoading.set(true);
    const userId = this.auth.currentUser!.id;
    this.userService.update(userId, this.profileForm.value as any).subscribe({
      next: (u) => {
        this.auth.refreshUser(u);
        this.profileLoading.set(false);
        this.notif.success('Perfil actualizado');
      },
      error: () => { this.profileLoading.set(false); this.notif.error('Error al actualizar'); }
    });
  }

  changePassword(): void {
    if (this.pwdForm.invalid) return;
    this.pwdLoading.set(true);
    const userId = this.auth.currentUser!.id;
    const { currentPassword, newPassword } = this.pwdForm.value;
    this.userService.changePassword(userId, { currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.pwdLoading.set(false);
        this.pwdForm.reset();
        this.notif.success('Contraseña actualizada');
      },
      error: (err) => {
        this.pwdLoading.set(false);
        this.notif.error(err.error?.message || 'Error al cambiar contraseña');
      }
    });
  }

  toggleTwoFactor(enable: boolean): void {
    this.twofaLoading.set(true);
    const action = enable ? this.auth.enableTwoFactor() : this.auth.disableTwoFactor();
    action.subscribe({
      next: () => {
        this.twofaLoading.set(false);
        this.notif.success(enable ? '2FA activado' : '2FA desactivado');
      },
      error: () => {
        this.twofaLoading.set(false);
        this.notif.error('Error al cambiar configuración de 2FA');
      }
    });
  }
}

