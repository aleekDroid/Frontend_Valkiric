import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px;max-width:900px">
      <div class="page-header">
        <h1>Carrito</h1>
        <p>{{ cart.count }} artículo{{ cart.count !== 1 ? 's' : '' }}</p>
      </div>

      @if (cart.items.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos desde el catálogo para comenzar.</p>
          <a routerLink="/catalog" class="btn btn-primary" style="margin-top:20px">Ver Catálogo</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cart.items; track item.product.id) {
              <div class="cart-item">
                <img [src]="item.product.imageUrl" [alt]="item.product.name" class="item-img" />
                <div class="item-info">
                  <a [routerLink]="['/product', item.product.id]" class="item-name">{{ item.product.name }}</a>
                  <span class="item-cat">{{ item.product.category }}</span>
                  <span class="item-unit">\${{ item.product.price | number:'1.2-2' }} c/u</span>
                </div>
                <div class="item-qty">
                  <button class="qty-btn" (click)="cart.updateQuantity(item.product.id, item.quantity - 1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="cart.updateQuantity(item.product.id, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock">+</button>
                </div>
                <div class="item-subtotal">\${{ (item.product.price * item.quantity) | number:'1.2-2' }}</div>
                <button class="remove-btn" (click)="cart.remove(item.product.id)" title="Eliminar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            }

            <button class="btn btn-ghost btn-sm" (click)="cart.clear()" style="margin-top:8px">
              Vaciar carrito
            </button>
          </div>

          <div class="cart-summary card">
            <h3>Resumen</h3>
            <div class="summary-row">
              <span>Subtotal ({{ cart.count }} artículos)</span>
              <strong>\${{ cart.total | number:'1.2-2' }}</strong>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <strong class="free-ship">GRATIS</strong>
            </div>
            <hr class="divider" />
            <div class="summary-total">
              <span>Total</span>
              <strong>\${{ cart.total | number:'1.2-2' }} MXN</strong>
            </div>
            @if (auth.isLoggedIn()) {
              <a routerLink="/checkout" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:20px">
                Proceder al Pago
              </a>
            } @else {
              <a routerLink="/login" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:20px">
                Inicia Sesión para Pagar
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 32px;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 16px;
    }

    .item-img {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background: var(--color-surface-2);
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-text);
      &:hover { color: var(--color-primary); }
    }

    .item-cat {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-transform: capitalize;
    }

    .item-unit {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .item-qty {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;

      span {
        min-width: 40px;
        text-align: center;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 6px;
        background: var(--color-surface);
      }
    }

    .qty-btn {
      width: 34px;
      height: 34px;
      background: var(--color-surface-2);
      border: none;
      color: var(--color-text);
      font-size: 1.1rem;
      cursor: pointer;
      transition: background var(--transition);
      font-family: var(--font-body);
      &:hover { background: var(--color-border); }
      &:disabled { opacity: 0.3; cursor: not-allowed; }
    }

    .item-subtotal {
      font-weight: 700;
      font-size: 1rem;
      min-width: 90px;
      text-align: right;
      font-family: var(--font-display);
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: var(--radius-sm);
      transition: all var(--transition);
      &:hover { color: var(--color-danger); background: rgba(192,57,43,.1); }
    }

    .cart-summary {
      position: sticky;
      top: 90px;

      h3 {
        font-family: var(--font-display);
        font-size: 1.1rem;
        margin-bottom: 20px;
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    .free-ship { color: var(--color-success); }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;

      span { font-size: 1rem; font-weight: 600; }
      strong { font-size: 1.3rem; font-family: var(--font-display); }
    }

    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-summary { position: static; }
      .item-subtotal { display: none; }
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
}
