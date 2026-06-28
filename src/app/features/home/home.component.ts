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
  isNightTime = signal(false);

  readonly categories = [
    { id: 'supplements', label: 'Suplementos', desc: 'Proteinas, creatina, pre-entreno y mas' },
    { id: 'clothing', label: 'Ropa', desc: 'Playeras, shorts, leggings de alto rendimiento' },
    { id: 'accessories', label: 'Accesorios', desc: 'Cinturones, guantes, bandas y equipo' },
    { id: 'merch', label: 'Merch', desc: 'Coleccion exclusiva Valkiric' }
  ];

  readonly resources = [
    {
      name: 'MuscleWiki',
      url: 'https://musclewiki.com',
      desc: 'Encuentra ejercicios por grupo muscular con guias visuales interactivas',
      color: '#3498db'
    },
    {
      name: 'Healthline Nutrition',
      url: 'https://www.healthline.com/nutrition',
      desc: 'Guias nutricionales respaldadas por ciencia para optimizar tu dieta',
      color: '#27AE60'
    },
    {
      name: 'ExRx.net',
      url: 'https://exrx.net',
      desc: 'Base de datos completa de ejercicios con biomecanica y tecnica correcta',
      color: '#F39C12'
    }
  ];

  ngOnInit(): void {
    const currentHour = new Date().getHours();
    this.isNightTime.set(currentHour >= 20 || currentHour < 5);

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