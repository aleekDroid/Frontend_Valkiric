import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications$ = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications$.asObservable();
  private counter = 0;

  show(message: string, type: NotificationType = 'info', duration = 4000): void {
    const id = ++this.counter;
    const notification: Notification = { id, type, message };
    this._notifications$.next([...this._notifications$.value, notification]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }
  warning(message: string): void { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this._notifications$.next(
      this._notifications$.value.filter(n => n.id !== id)
    );
  }
}
