import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  featuredProducts = signal<Product[]>([]);
  searchQuery = signal('');
  loading = signal(true);

  readonly categories = [
    { id: 'supplements', label: 'Suplementos', icon: '🧪', desc: 'Proteínas, creatina, pre-entreno y más' },
    { id: 'clothing', label: 'Ropa', icon: '👕', desc: 'Playeras, shorts, leggings de alto rendimiento' },
    { id: 'accessories', label: 'Accesorios', icon: '🏋️', desc: 'Cinturones, guantes, bandas y equipo' },
    { id: 'merch', label: 'Merch', icon: '⚡', desc: 'Colección exclusiva Valkiric' }
  ];

  readonly resources = [
    {
      name: 'MuscleWiki',
      url: 'https://musclewiki.com',
      desc: 'Encuentra ejercicios por grupo muscular con guías visuales interactivas',
      icon: '💪',
      color: '#3498db'
    },
    {
      name: 'Healthline Nutrition',
      url: 'https://www.healthline.com/nutrition',
      desc: 'Guías nutricionales respaldadas por ciencia para optimizar tu dieta',
      icon: '🥗',
      color: '#27AE60'
    },
    {
      name: 'ExRx.net',
      url: 'https://exrx.net',
      desc: 'Base de datos completa de ejercicios con biomecánica y técnica correcta',
      icon: '📋',
      color: '#F39C12'
    }
  ];

  ngOnInit(): void {
    this.productService.getAll().subscribe({
      next: (products) => {
        this.featuredProducts.set(products.filter(p => p.isActive).slice(0, 8));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  search(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/catalog'], { queryParams: { search: q } });
    }
  }

  onSearchKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.search();
  }
}
