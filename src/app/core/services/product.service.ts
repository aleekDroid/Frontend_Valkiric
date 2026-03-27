import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/products`;

  getAll(params?: { search?: string; category?: string }): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    return this.http.get<Product[]>(this.api, { params: httpParams });
  }

  getOne(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.api, data);
  }

  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
