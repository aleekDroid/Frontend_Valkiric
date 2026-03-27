import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/orders`;

  createOrder(body: { items: any[]; paymentDetails: any }): Observable<Order> {
    return this.http.post<Order>(this.api, body);
  }

  myOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}/my`);
  }

  allOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.api);
  }

  getOne(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.api}/${id}`);
  }

  updateStatus(id: string, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.api}/${id}/status`, { status });
  }
}
