import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardStats } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px">
      <div class="page-header">
        <h1>Panel de Administración</h1>
        <p>Vista general del negocio</p>
      </div>

      @if (loading()) {
        <p style="color:var(--color-text-muted)">Cargando estadísticas...</p>
      } @else if (stats()) {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-body">
              <span class="stat-label">Usuarios</span>
              <strong class="stat-val">{{ stats()!.totalUsers }}</strong>
            </div>
            <a routerLink="/admin/users" class="stat-link">Ver →</a>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-body">
              <span class="stat-label">Productos</span>
              <strong class="stat-val">{{ stats()!.totalProducts }}</strong>
            </div>
            <a routerLink="/admin/products" class="stat-link">Ver →</a>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🛒</div>
            <div class="stat-body">
              <span class="stat-label">Órdenes</span>
              <strong class="stat-val">{{ stats()!.totalOrders }}</strong>
            </div>
            <a routerLink="/admin/orders" class="stat-link">Ver →</a>
          </div>
          <div class="stat-card highlight">
            <div class="stat-icon">💰</div>
            <div class="stat-body">
              <span class="stat-label">Ingresos</span>
              <strong class="stat-val">\${{ stats()!.totalRevenue | number:'1.2-2' }}</strong>
            </div>
          </div>
        </div>

        <!-- Two columns -->
        <div class="admin-grid">
          <!-- Low Stock -->
          <div class="card">
            <h3 class="admin-section-title">⚠️ Stock Bajo</h3>
            @if (stats()!.lowStockProducts?.length === 0) {
              <p style="color:var(--color-text-muted);font-size:.875rem">Sin productos con stock bajo.</p>
            } @else {
              <div class="table-wrapper">
                <table>
                  <thead><tr><th>Producto</th><th>Stock</th><th>Precio</th></tr></thead>
                  <tbody>
                    @for (p of stats()!.lowStockProducts; track p.id) {
                      <tr>
                        <td>
                          <a [routerLink]="['/product', p.id]" style="color:var(--color-text)">{{ p.name }}</a>
                        </td>
                        <td>
                          <span class="badge" [class]="p.stock === 0 ? 'badge-danger' : 'badge-warning'">
                            {{ p.stock === 0 ? 'Agotado' : p.stock + ' uds.' }}
                          </span>
                        </td>
                        <td>\${{ p.price | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Recent Orders -->
          <div class="card">
            <h3 class="admin-section-title">📋 Órdenes Recientes</h3>
            @if (stats()!.recentOrders?.length === 0) {
              <p style="color:var(--color-text-muted);font-size:.875rem">Sin órdenes recientes.</p>
            } @else {
              <div class="table-wrapper">
                <table>
                  <thead><tr><th>Ref.</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
                  <tbody>
                    @for (o of stats()!.recentOrders; track o.id) {
                      <tr>
                        <td><code style="font-size:.75rem">{{ (o.paymentReference || o.id).slice(0,12) }}</code></td>
                        <td><strong>\${{ o.total | number:'1.2-2' }}</strong></td>
                        <td><span class="badge" [class]="statusBadge(o.status)">{{ o.status }}</span></td>
                        <td style="font-size:.8rem;color:var(--color-text-muted)">{{ o.createdAt | date:'dd/MM/yy' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all var(--transition);

      &:hover { border-color: var(--color-primary); }
      &.highlight { border-color: rgba(192,57,43,.4); background: rgba(192,57,43,.05); }
    }

    .stat-icon { font-size: 2rem; }

    .stat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-muted);
    }

    .stat-val {
      font-family: var(--font-display);
      font-size: 1.6rem;
    }

    .stat-link {
      font-size: 0.8rem;
      color: var(--color-primary);
      &:hover { text-decoration: underline; }
    }

    .admin-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .admin-section-title {
      font-family: var(--font-display);
      font-size: 0.95rem;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    @media (max-width: 768px) {
      .admin-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashService = inject(DashboardService);
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      paid: 'badge-success', delivered: 'badge-success', shipped: 'badge-info',
      processing: 'badge-warning', pending: 'badge-warning', cancelled: 'badge-danger'
    };
    return map[status] || 'badge-muted';
  }

  ngOnInit(): void {
    this.dashService.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
