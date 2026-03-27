import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px">
      <div class="admin-header">
        <div>
          <h1 class="page-title">Usuarios</h1>
          <p style="color:var(--color-text-muted)">{{ users().length }} usuarios registrados</p>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar">{{ u.name.charAt(0).toUpperCase() }}</div>
                    <strong>{{ u.name }}</strong>
                  </div>
                </td>
                <td style="color:var(--color-text-muted);font-size:.875rem">{{ u.email }}</td>
                <td>
                  <span class="badge" [class]="u.role === 'ADMIN' ? 'badge-danger' : 'badge-info'">
                    {{ u.role }}
                  </span>
                </td>
                <td style="font-size:.875rem;color:var(--color-text-muted)">{{ u.phone || '—' }}</td>
                <td>
                  <span class="badge" [class]="u.isActive ? 'badge-success' : 'badge-muted'">
                    {{ u.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:8px">
                    <button class="btn btn-ghost btn-sm" (click)="openEdit(u)" [disabled]="u.id === currentUserId">
                      Editar
                    </button>
                    <button
                      class="btn btn-sm"
                      [class]="u.isActive ? 'btn-outline' : 'btn-primary'"
                      (click)="toggleActive(u)"
                      [disabled]="u.id === currentUserId"
                    >
                      {{ u.isActive ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Usuario</h2>
            <button class="btn btn-ghost btn-icon" (click)="closeModal()">✕</button>
          </div>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input formControlName="name" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input formControlName="phone" class="form-control" placeholder="+52 000 000 0000" />
            </div>
            <div class="form-group">
              <label class="form-label">Rol</label>
              <select formControlName="role" class="form-control">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                @if (saving()) { <span class="spinner"></span> } Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;flex-wrap:wrap;gap:16px; }
    .page-title { font-family:var(--font-display);font-size:1.8rem; }
    .avatar {
      width:32px;height:32px;background:var(--color-primary);color:#fff;border-radius:50%;
      display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;
      font-family:var(--font-display);flex-shrink:0;
    }
    select.form-control {
      appearance:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9E9E' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat:no-repeat;background-position:right 12px center;cursor:pointer;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private notif = inject(NotificationService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  showModal = signal(false);
  editingUser = signal<User | null>(null);
  saving = signal(false);
  currentUserId = this.auth.currentUser?.id;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    role: ['USER', Validators.required]
  });

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.userService.getAll().subscribe(u => this.users.set(u));
  }

  openEdit(u: User): void {
    this.editingUser.set(u);
    this.form.patchValue({ name: u.name, phone: u.phone || '', role: u.role });
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.editingUser.set(null); }

  save(): void {
    if (this.form.invalid || !this.editingUser()) return;
    this.saving.set(true);
    this.userService.update(this.editingUser()!.id, this.form.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadUsers();
        this.notif.success('Usuario actualizado');
      },
      error: () => { this.saving.set(false); this.notif.error('Error al actualizar'); }
    });
  }

  toggleActive(u: User): void {
    this.userService.update(u.id, { isActive: !u.isActive }).subscribe({
      next: () => { this.loadUsers(); this.notif.success(`Usuario ${u.isActive ? 'desactivado' : 'activado'}`); },
      error: () => this.notif.error('Error al actualizar estado')
    });
  }
}
