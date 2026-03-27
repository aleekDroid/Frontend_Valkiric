import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px;max-width:880px">
      <div class="page-header">
        <h1>Checkout</h1>
        <p>Pago simulado — sin cargos reales</p>
      </div>

      @if (cart.items.length === 0 && !orderSuccess()) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Carrito vacío</h3>
          <a routerLink="/catalog" class="btn btn-primary" style="margin-top:16px">Ver Catálogo</a>
        </div>
      } @else if (orderSuccess()) {
        <div class="success-screen">
          <div class="success-icon">✅</div>
          <h2>¡Pedido Confirmado!</h2>
          <p>Tu pedido ha sido procesado exitosamente.</p>
          <div class="ref-box">
            <span class="ref-label">Referencia de Pago</span>
            <span class="ref-code">{{ paymentRef() }}</span>
          </div>
          <div class="success-actions">
            <a routerLink="/" class="btn btn-primary">Volver al Inicio</a>
            <a routerLink="/profile" class="btn btn-outline">Ver Mis Pedidos</a>
          </div>
        </div>
      } @else {
        <div class="checkout-layout">
          <!-- Payment Form -->
          <div class="payment-form card">
            <div class="payment-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0070ba" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <h3>Datos de Pago</h3>
            </div>

            <form [formGroup]="form" (ngSubmit)="submitOrder()">
              <div class="form-group">
                <label class="form-label">Nombre del Titular</label>
                <input formControlName="cardHolder" class="form-control" placeholder="Juan García López"
                  [class.is-invalid]="form.get('cardHolder')?.invalid && form.get('cardHolder')?.touched" />
                @if (form.get('cardHolder')?.invalid && form.get('cardHolder')?.touched) {
                  <span class="form-error">Nombre requerido</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Número de Tarjeta</label>
                <input formControlName="cardNumber" class="form-control" placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  (input)="formatCard($event)"
                  [class.is-invalid]="form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched" />
                @if (form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched) {
                  <span class="form-error">Número de tarjeta inválido (16 dígitos)</span>
                }
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Vencimiento</label>
                  <input formControlName="expiry" class="form-control" placeholder="MM/AA" maxlength="5"
                    (input)="formatExpiry($event)"
                    [class.is-invalid]="form.get('expiry')?.invalid && form.get('expiry')?.touched" />
                  @if (form.get('expiry')?.invalid && form.get('expiry')?.touched) {
                    <span class="form-error">Fecha inválida</span>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">CVV</label>
                  <input formControlName="cvv" class="form-control" placeholder="123" maxlength="4" type="password"
                    [class.is-invalid]="form.get('cvv')?.invalid && form.get('cvv')?.touched" />
                  @if (form.get('cvv')?.invalid && form.get('cvv')?.touched) {
                    <span class="form-error">CVV inválido</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email de Confirmación</label>
                <input formControlName="email" class="form-control" placeholder="tu@email.com" type="email"
                  [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched" />
                @if (form.get('email')?.invalid && form.get('email')?.touched) {
                  <span class="form-error">Email inválido</span>
                }
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg pay-btn"
                [disabled]="form.invalid || loading()"
              >
                @if (loading()) {
                  <span class="spinner"></span>
                  Procesando...
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pagar \${{ cart.total | number:'1.2-2' }} MXN
                }
              </button>

              <p class="secure-note">🔒 Pago simulado — No se realizan cargos reales</p>
            </form>
          </div>

          <!-- Order Summary -->
          <div class="order-summary card">
            <h3>Tu Pedido</h3>
            <div class="summary-items">
              @for (item of cart.items; track item.product.id) {
                <div class="summary-item">
                  <img [src]="item.product.imageUrl" [alt]="item.product.name" class="summary-img" />
                  <div class="summary-item-info">
                    <span class="summary-item-name">{{ item.product.name }}</span>
                    <span class="summary-item-qty">×{{ item.quantity }}</span>
                  </div>
                  <span class="summary-item-price">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</span>
                </div>
              }
            </div>
            <hr class="divider" />
            <div class="summary-total">
              <span>Total</span>
              <strong>\${{ cart.total | number:'1.2-2' }} MXN</strong>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 32px;
      align-items: start;
    }

    .payment-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;

      h3 { font-family: var(--font-display); font-size: 1.1rem; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .pay-btn {
      width: 100%;
      justify-content: center;
      margin-top: 8px;
      font-size: 1rem;
    }

    .secure-note {
      text-align: center;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 12px;
    }

    .order-summary {
      position: sticky;
      top: 90px;

      h3 {
        font-family: var(--font-display);
        font-size: 1rem;
        margin-bottom: 16px;
      }
    }

    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .summary-img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
    }

    .summary-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .summary-item-name { font-size: 0.85rem; font-weight: 500; }
    .summary-item-qty  { font-size: 0.75rem; color: var(--color-text-muted); }
    .summary-item-price { font-weight: 600; font-size: 0.9rem; }

    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      strong { font-family: var(--font-display); font-size: 1.2rem; }
    }

    /* Success */
    .success-screen {
      text-align: center;
      padding: 60px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      animation: fadeIn 0.4s ease;
    }

    .success-icon { font-size: 4rem; }

    .success-screen h2 {
      font-family: var(--font-display);
      font-size: 2rem;
    }

    .ref-box {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px 32px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 8px 0;
    }

    .ref-label { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
    .ref-code  { font-family: var(--font-display); font-size: 1.3rem; color: var(--color-primary); letter-spacing: 0.05em; }

    .success-actions { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }

    @media (max-width: 768px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .order-summary { position: static; }
    }
  `]
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  cart = inject(CartService);
  private orderService = inject(OrderService);
  private notif = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);
  orderSuccess = signal(false);
  paymentRef = signal('');

  form = this.fb.group({
    cardHolder: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4} \d{4} \d{4} \d{4}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    email: ['', [Validators.required, Validators.email]]
  });

  formatCard(e: Event): void {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = val.replace(/(.{4})/g, '$1 ').trim();
    this.form.get('cardNumber')!.setValue(input.value, { emitEvent: false });
  }

  formatExpiry(e: Event): void {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').substring(0, 4);
    if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
    input.value = val;
    this.form.get('expiry')!.setValue(input.value, { emitEvent: false });
  }

  submitOrder(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    const items = this.cart.items.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      imageUrl: i.product.imageUrl
    }));

    const paymentDetails = {
      cardHolder: this.form.value.cardHolder,
      last4: this.form.value.cardNumber!.slice(-4),
      email: this.form.value.email
    };

    this.orderService.createOrder({ items, paymentDetails }).subscribe({
      next: (order) => {
        this.cart.clear();
        this.paymentRef.set(order.paymentReference || `PAY-${Date.now()}`);
        this.orderSuccess.set(true);
        this.loading.set(false);
        this.notif.success('¡Pago exitoso! Tu pedido fue confirmado.');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Error al procesar el pedido';
        this.notif.error(msg);
      }
    });
  }
}
