import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container" style="padding-top:40px;padding-bottom:80px">
      <div class="admin-header">
        <div>
          <h1 class="page-title">Productos</h1>
          <p style="color:var(--color-text-muted)">{{ products().length }} productos en total</p>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">+ Nuevo Producto</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td>
                  <img [src]="p.imageUrl" [alt]="p.name" style="width:48px;height:48px;object-fit:cover;border-radius:4px;background:var(--color-surface-2)" />
                </td>
                <td style="font-weight:600;max-width:200px">{{ p.name }}</td>
                <td><span class="badge badge-muted">{{ p.category }}</span></td>
                <td>\${{ p.price | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [class]="p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'">
                    {{ p.stock }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class]="p.isActive ? 'badge-success' : 'badge-danger'">
                    {{ p.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:8px">
                    <button class="btn btn-ghost btn-sm" (click)="openEdit(p)">Editar</button>
                    <button class="btn btn-sm" [class]="p.isActive ? 'btn-outline' : 'btn-primary'" (click)="toggleActive(p)">
                      {{ p.isActive ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingProduct() ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
            <button class="btn btn-ghost btn-icon" (click)="closeModal()">✕</button>
          </div>

          <form [formGroup]="form" (ngSubmit)="save()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">Nombre</label>
                <input formControlName="name" class="form-control" />
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">Descripción</label>
                <textarea formControlName="description" class="form-control" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Precio</label>
                <input formControlName="price" type="number" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Stock</label>
                <input formControlName="stock" type="number" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">Categoría</label>
                <select formControlName="category" class="form-control">
                  <option value="supplements">Suplementos</option>
                  <option value="clothing">Ropa</option>
                  <option value="accessories">Accesorios</option>
                  <option value="merch">Merch</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Estado</label>
                <select formControlName="isActive" class="form-control">
                  <option [ngValue]="true">Activo</option>
                  <option [ngValue]="false">Inactivo</option>
                </select>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">URL de Imagen</label>
                <input formControlName="imageUrl" class="form-control" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
                @if (saving()) { <span class="spinner"></span> }
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-family: var(--font-display);
      font-size: 1.8rem;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239E9E9E' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      cursor: pointer;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['supplements', Validators.required],
    imageUrl: ['', Validators.required],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe(p => this.products.set(p));
  }

  openCreate(): void {
    this.editingProduct.set(null);
    this.form.reset({ category: 'supplements', isActive: true, price: 0, stock: 0 });
    this.showModal.set(true);
  }

  openEdit(p: Product): void {
    this.editingProduct.set(p);
    this.form.patchValue(p as any);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value as any;
    const op = this.editingProduct()
      ? this.productService.update(this.editingProduct()!.id, data)
      : this.productService.create(data);

    op.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadProducts();
        this.notif.success(this.editingProduct() ? 'Producto actualizado' : 'Producto creado');
      },
      error: () => { this.saving.set(false); this.notif.error('Error al guardar'); }
    });
  }

  toggleActive(p: Product): void {
    this.productService.update(p.id, { isActive: !p.isActive }).subscribe({
      next: () => {
        this.loadProducts();
        this.notif.success(`Producto ${p.isActive ? 'desactivado' : 'activado'}`);
      },
      error: () => this.notif.error('Error al actualizar estado')
    });
  }
}
