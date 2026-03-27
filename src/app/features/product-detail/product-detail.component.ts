import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" style="padding-top:32px;padding-bottom:80px">

      @if (loading()) {
        <div class="loading-state">Cargando producto...</div>
      } @else if (product()) {
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/">Inicio</a>
          <span class="sep">›</span>
          <a routerLink="/catalog">Catálogo</a>
          <span class="sep">›</span>
          <a [routerLink]="['/catalog']" [queryParams]="{category: product()!.category}">{{ categoryLabel }}</a>
          <span class="sep">›</span>
          <span class="current">{{ product()!.name }}</span>
        </nav>

        <div class="detail-layout">
          <!-- Image -->
          <div class="detail-image-wrap">
            <img
              [src]="product()!.imageUrl"
              [alt]="product()!.name"
              class="detail-image"
              (error)="onImgError($event)"
            />
            <span class="detail-category">{{ categoryLabel }}</span>
          </div>

          <!-- Info -->
          <div class="detail-info">
            <h1 class="detail-title">{{ product()!.name }}</h1>
            <p class="detail-price">\${{ product()!.price | number:'1.2-2' }} <span class="detail-currency">MXN</span></p>

            <div class="detail-stock" [class.low]="product()!.stock <= 5" [class.out]="product()!.stock === 0">
              @if (product()!.stock === 0) {
                <span>⛔ Agotado</span>
              } @else if (product()!.stock <= 5) {
                <span>⚠️ Últimas {{ product()!.stock }} unidades</span>
              } @else {
                <span>✅ En stock ({{ product()!.stock }} disponibles)</span>
              }
            </div>

            <p class="detail-desc">{{ product()!.description }}</p>

            <!-- Quantity -->
            @if (product()!.stock > 0) {
              <div class="quantity-row">
                <label class="form-label">Cantidad</label>
                <div class="qty-control">
                  <button class="qty-btn" (click)="decreaseQty()" [disabled]="qty() <= 1">−</button>
                  <span class="qty-val">{{ qty() }}</span>
                  <button class="qty-btn" (click)="increaseQty()" [disabled]="qty() >= product()!.stock">+</button>
                </div>
              </div>

              <button
                class="btn btn-primary btn-lg add-cart-btn"
                (click)="addToCart()"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Agregar al Carrito
              </button>
            }

            <!-- Details JSON -->
            @if (product()!.details && objectKeys(product()!.details!).length > 0) {
              <div class="detail-extra">
                <h3>Especificaciones</h3>
                <div class="specs-grid">
                  @for (key of objectKeys(product()!.details!); track key) {
                    <div class="spec-item">
                      <span class="spec-key">{{ key }}</span>
                      <span class="spec-val">{{ product()!.details![key] }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Producto no encontrado</h3>
          <a routerLink="/catalog" class="btn btn-primary" style="margin-top:16px">Ver catálogo</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .loading-state {
      padding: 80px;
      text-align: center;
      color: var(--color-text-muted);
    }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }

    .detail-image-wrap {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
    }

    .detail-image {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
    }

    .detail-category {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(0,0,0,.75);
      color: var(--color-text-muted);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 4px 12px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }

    .detail-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-title {
      font-size: 2rem;
      font-family: var(--font-display);
      line-height: 1.2;
    }

    .detail-price {
      font-size: 2rem;
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--color-text);
    }

    .detail-currency {
      font-size: 1rem;
      color: var(--color-text-muted);
      font-weight: 400;
      font-family: var(--font-body);
    }

    .detail-stock {
      font-size: 0.875rem;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(39,174,96,.1);
      color: var(--color-success);

      &.low { background: rgba(243,156,18,.1); color: var(--color-warning); }
      &.out { background: rgba(192,57,43,.1); color: var(--color-danger); }
    }

    .detail-desc {
      color: var(--color-text-muted);
      line-height: 1.7;
      font-size: 0.95rem;
    }

    .quantity-row { display: flex; flex-direction: column; gap: 8px; }

    .qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      width: fit-content;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .qty-btn {
      width: 40px;
      height: 40px;
      background: var(--color-surface-2);
      border: none;
      color: var(--color-text);
      font-size: 1.2rem;
      cursor: pointer;
      transition: background var(--transition);
      font-family: var(--font-body);
      &:hover { background: var(--color-border); }
      &:disabled { opacity: 0.3; cursor: not-allowed; }
    }

    .qty-val {
      min-width: 48px;
      text-align: center;
      font-weight: 700;
      font-size: 1rem;
      background: var(--color-surface);
    }

    .add-cart-btn { width: 100%; justify-content: center; }

    .detail-extra {
      border-top: 1px solid var(--color-border);
      padding-top: 20px;

      h3 {
        font-family: var(--font-display);
        font-size: 0.9rem;
        margin-bottom: 14px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-text-muted);
      }
    }

    .specs-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .spec-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--color-surface-2);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
    }

    .spec-key {
      color: var(--color-text-muted);
      text-transform: capitalize;
    }

    .spec-val {
      color: var(--color-text);
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .detail-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private notif = inject(NotificationService);
  private router = inject(Router);

  product = signal<Product | null>(null);
  loading = signal(true);
  qty = signal(1);

  get categoryLabel(): string {
    const map: Record<string, string> = {
      supplements: 'Suplementos', clothing: 'Ropa', accessories: 'Accesorios', merch: 'Merch'
    };
    return map[this.product()?.category || ''] || '';
  }

  objectKeys = Object.keys;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getOne(id).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: () => { this.product.set(null); this.loading.set(false); }
    });
  }

  increaseQty(): void {
    if (this.qty() < (this.product()?.stock ?? 1)) this.qty.update(v => v + 1);
  }

  decreaseQty(): void {
    if (this.qty() > 1) this.qty.update(v => v - 1);
  }

  addToCart(): void {
    if (!this.auth.isLoggedIn()) {
      this.notif.info('Inicia sesión para agregar al carrito');
      this.router.navigate(['/login']);
      return;
    }
    this.cart.add(this.product()!, this.qty());
    this.notif.success(`${this.product()!.name} agregado al carrito (×${this.qty()})`);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=60';
  }
}
