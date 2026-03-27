import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'valkiric_cart';
  private _items$ = new BehaviorSubject<CartItem[]>(this.loadCart());

  items$ = this._items$.asObservable();

  get items(): CartItem[] {
    return this._items$.value;
  }

  get count(): number {
    return this._items$.value.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
  }

  get total(): number {
    return this._items$.value.reduce((sum: number, i: CartItem) => sum + i.product.price * i.quantity, 0);
  }

  add(product: Product, quantity = 1): void {
    const current = [...this._items$.value];
    const idx = current.findIndex(i => i.product.id === product.id);
    if (idx > -1) {
      current[idx] = { ...current[idx], quantity: current[idx].quantity + quantity };
    } else {
      current.push({ product, quantity });
    }
    this.save(current);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    const current = this._items$.value.map((i: CartItem) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.save(current);
  }

  remove(productId: string): void {
    this.save(this._items$.value.filter((i: CartItem) => i.product.id !== productId));
  }

  clear(): void {
    this.save([]);
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this._items$.next(items);
  }

  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
