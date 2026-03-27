import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product, ProductCategory } from '../../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Catálogo</h1>
        <p>{{ filtered().length }} producto{{ filtered().length !== 1 ? 's' : '' }} encontrado{{ filtered().length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-wrap">
          <input
            type="text"
            placeholder="Buscar productos..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)"
            class="form-control"
          />
        </div>
        <div class="category-tabs">
          <button
            class="tab-btn"
            [class.active]="activeCategory() === ''"
            (click)="setCategory('')"
          >Todos</button>
          @for (cat of categories; track cat.id) {
            <button
              class="tab-btn"
              [class.active]="activeCategory() === cat.id"
              (click)="setCategory(cat.id)"
            >{{ cat.label }}</button>
          }
        </div>
      </div>

      <!-- Grid -->
      @if (loading()) {
        <div class="products-grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton-card" style="height:360px"></div>
          }
        </div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>No se encontraron productos con esos filtros.</p>
          <button class="btn btn-outline" style="margin-top:16px" (click)="clearFilters()">Limpiar filtros</button>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of filtered(); track product.id) {
            <app-product-card [product]="product" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-wrap {
      flex: 0 0 300px;
      input { height: 42px; }
    }

    .category-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 8px 16px;
      border: 1px solid var(--color-border);
      background: transparent;
      color: var(--color-text-muted);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all var(--transition);
      font-family: var(--font-body);

      &:hover { border-color: var(--color-primary); color: var(--color-primary); }
      &.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
    }

    .skeleton-card {
      background: linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-2) 50%, var(--color-surface) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @media (max-width: 640px) {
      .search-wrap { flex: 1 1 100%; }
    }
  `]
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allProducts = signal<Product[]>([]);
  filtered = signal<Product[]>([]);
  loading = signal(true);
  searchQuery = '';
  activeCategory = signal('');

  readonly categories = [
    { id: 'supplements', label: 'Suplementos' },
    { id: 'clothing', label: 'Ropa' },
    { id: 'accessories', label: 'Accesorios' },
    { id: 'merch', label: 'Merch' }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.activeCategory.set(params['category'] || '');
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (products) => {
        this.allProducts.set(products.filter(p => p.isActive));
        this.loading.set(false);
        this.applyFilters();
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters(): void {
    let result = this.allProducts();
    if (this.activeCategory()) {
      result = result.filter(p => p.category === this.activeCategory());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    this.filtered.set(result);
  }

  onSearch(val: string): void {
    this.searchQuery = val;
    this.applyFilters();
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
    this.router.navigate([], {
      queryParams: { category: cat || null, search: this.searchQuery || null },
      queryParamsHandling: 'merge'
    });
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeCategory.set('');
    this.applyFilters();
  }
}
