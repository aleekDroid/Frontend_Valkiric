import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  getOne(id: string): Observable<User> {
    return this.http.get<User>(`${this.api}/${id}`);
  }

  update(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.api}/${id}`, data);
  }

  changePassword(id: string, body: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.patch(`${this.api}/${id}/password`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
