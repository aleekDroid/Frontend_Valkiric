import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-card">
      <a [routerLink]="['/product', product.id]" class="card-image-wrap">
        <img
          [src]="product.imageUrl"
          [alt]="product.name"
          class="card-image"
          loading="lazy"
          (error)="onImgError($event)"
        />
        <span class="category-badge">{{ categoryLabel }}</span>
        @if (product.stock <= 5 && product.stock > 0) {
          <span class="low-stock-badge">¡Últimas {{ product.stock }}!</span>
        }
        @if (product.stock === 0) {
          <span class="out-of-stock-badge">Agotado</span>
        }
      </a>
      <div class="card-body">
        <a [routerLink]="['/product', product.id]" class="card-title">{{ product.name }}</a>
        <p class="card-desc">{{ product.description | slice:0:80 }}{{ product.description.length > 80 ? '...' : '' }}</p>
        <div class="card-footer">
          <span class="card-price">\${{ product.price | number:'1.2-2' }}</span>
          <button
            class="btn btn-primary btn-sm add-btn"
            [disabled]="product.stock === 0"
            (click)="addToCart($event)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Agregar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;

      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
      }
    }

    .card-image-wrap {
      position: relative;
      display: block;
      padding-top: 66%;
      overflow: hidden;
      background: var(--color-surface-2);
    }

    .card-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .product-card:hover .card-image { transform: scale(1.04); }

    .category-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,.7);
      color: var(--color-text-muted);
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 8px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }

    .low-stock-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(243,156,18,.9);
      color: #000;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 20px;
    }

    .out-of-stock-badge {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.6);
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: var(--font-display);
    }

    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .card-title {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: 0.02em;
      line-height: 1.3;
      &:hover { color: var(--color-primary); }
    }

    .card-desc {
      font-size: 0.8rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      flex: 1;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
      gap: 8px;
    }

    .card-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text);
      font-family: var(--font-display);
    }

    .add-btn {
      flex-shrink: 0;
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cart = inject(CartService);
  private auth = inject(AuthService);
  private notif = inject(NotificationService);
  private router = inject(Router);

  get categoryLabel(): string {
    const map: Record<string, string> = {
      supplements: 'Suplementos',
      clothing: 'Ropa',
      accessories: 'Accesorios',
      merch: 'Merch'
    };
    return map[this.product.category] || this.product.category;
  }

  addToCart(e: MouseEvent): void {
    e.preventDefault();
    if (!this.auth.isLoggedIn()) {
      this.notif.info('Inicia sesión para agregar al carrito');
      this.router.navigate(['/login']);
      return;
    }
    this.cart.add(this.product);
    this.notif.success(`${this.product.name} agregado al carrito`);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=60';
  }
}
