import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  auth: AuthService = inject(AuthService);
  cart: CartService = inject(CartService);
  router: Router = inject(Router);

  searchQuery = signal('');
  menuOpen = signal(false);
  userMenuOpen = signal(false);
  catalogOpen = signal(false); 

  search(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/catalog'], { queryParams: { search: q } });
      this.searchQuery.set('');
    }
  }

  onSearchKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.search();
  }

  logout(): void {
    this.auth.logout();
    this.userMenuOpen.set(false);
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  toggleUserMenu(): void { this.userMenuOpen.update(v => !v); }

  closeMenus(): void {
    this.menuOpen.set(false);
    this.catalogOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) {
      this.userMenuOpen.set(false);
    }
  }
}