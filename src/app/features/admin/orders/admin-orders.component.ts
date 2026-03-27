import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px">
      <div class="admin-header">
        <div>
          <h1 class="page-title">Órdenes</h1>
          <p style="color:var(--color-text-muted)">{{ orders().length }} órdenes en total</p>
        </div>
      </div>

      @if (loading()) {
        <p style="color:var(--color-text-muted)">Cargando órdenes...</p>
      } @else {
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Referencia</th>
                <th>Cliente</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td>
                    <button class="expand-btn" (click)="toggleExpand(order.id)"
                      [class.expanded]="expanded().has(order.id)">
                      {{ expanded().has(order.id) ? '▼' : '▶' }}
                    </button>
                  </td>
                  <td><code style="font-size:.75rem">{{ (order.paymentReference || order.id).slice(0,14) }}</code></td>
                  <td style="font-size:.875rem">
                    {{ order.user?.name || '—' }}
                    <div style="font-size:.75rem;color:var(--color-text-muted)">{{ order.user?.email || '' }}</div>
                  </td>
                  <td style="text-align:center">{{ order.items.length }}</td>
                  <td><strong>\${{ order.total | number:'1.2-2' }}</strong></td>
                  <td>
                    <span class="badge" [class]="statusBadge(order.status)">{{ order.status }}</span>
                  </td>
                  <td style="font-size:.8rem;color:var(--color-text-muted)">
                    {{ order.createdAt | date:'dd/MM/yy HH:mm' }}
                  </td>
                  <td>
                    <select class="status-select" [value]="order.status" (change)="updateStatus(order.id, $event)">
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
                @if (expanded().has(order.id)) {
                  <tr class="expand-row">
                    <td colspan="8">
                      <div class="order-items">
                        <strong style="font-size:.8rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.08em">Artículos del pedido</strong>
                        <div class="items-list">
                          @for (item of order.items; track item.productId) {
                            <div class="order-item-row">
                              <img [src]="item.imageUrl || ''" [alt]="item.productName"
                                style="width:40px;height:40px;object-fit:cover;border-radius:4px;background:var(--color-surface-2)"
                                (error)="onImgErr($event)" />
                              <span class="item-name">{{ item.productName }}</span>
                              <span class="item-qty">×{{ item.quantity }}</span>
                              <span class="item-price">\${{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                            </div>
                          }
                        </div>
                        @if (order.paymentDetails) {
                          <div class="payment-details">
                            <span>Titular: {{ order.paymentDetails['cardHolder'] || '—' }}</span>
                            <span>Email: {{ order.paymentDetails['email'] || '—' }}</span>
                            @if (order.paymentDetails['last4']) {
                              <span>Tarjeta: ****{{ order.paymentDetails['last4'] }}</span>
                            }
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
    }
    .page-title { font-family: var(--font-display); font-size: 1.8rem; }

    .expand-btn {
      background: none; border: none; color: var(--color-text-muted);
      cursor: pointer; padding: 4px 8px; border-radius: var(--radius-sm);
      font-size: .7rem; transition: all var(--transition);
      &:hover { background: var(--color-surface-2); color: var(--color-text); }
      &.expanded { color: var(--color-primary); }
    }

    .expand-row td { padding: 0 !important; background: var(--color-surface-2); }

    .order-items {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .order-item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; }
    }

    .item-name { flex: 1; font-size: .875rem; font-weight: 500; }
    .item-qty  { color: var(--color-text-muted); font-size: .8rem; }
    .item-price { font-weight: 700; font-size: .9rem; }

    .payment-details {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      padding: 12px 0 0;
      border-top: 1px solid var(--color-border);
      font-size: .8rem;
      color: var(--color-text-muted);
    }

    .status-select {
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      border-radius: var(--radius-sm);
      padding: 4px 8px;
      font-size: .75rem;
      cursor: pointer;
      font-family: var(--font-body);
      outline: none;
      &:focus { border-color: var(--color-primary); }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private notif = inject(NotificationService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  expanded = signal<Set<string>>(new Set());

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      paid: 'badge-success', delivered: 'badge-success', shipped: 'badge-info',
      processing: 'badge-warning', pending: 'badge-warning', cancelled: 'badge-danger'
    };
    return map[status] || 'badge-muted';
  }

  ngOnInit(): void {
    this.orderService.allOrders().subscribe({
      next: (o) => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleExpand(id: string): void {
    const s = new Set(this.expanded());
    s.has(id) ? s.delete(id) : s.add(id);
    this.expanded.set(s);
  }

  updateStatus(orderId: string, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.orderService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
        this.notif.success('Estado actualizado');
      },
      error: () => this.notif.error('Error al actualizar estado')
    });
  }

  onImgErr(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=60';
  }
}
