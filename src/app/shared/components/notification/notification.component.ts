import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (n of (notif.notifications$ | async) || []; track n.id) {
        <div class="toast" [class]="'toast-' + n.type" (click)="notif.dismiss(n.id)">
          <span class="toast-icon">{{ icons[n.type] }}</span>
          <span class="toast-msg">{{ n.message }}</span>
          <button class="toast-close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
      width: calc(100vw - 40px);
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      animation: slideInRight 0.25s ease;
      font-size: 0.9rem;
      transition: opacity 0.2s;

      &:hover { opacity: 0.9; }
    }

    .toast-success { border-left: 3px solid var(--color-success); }
    .toast-error   { border-left: 3px solid var(--color-danger); }
    .toast-warning { border-left: 3px solid var(--color-warning); }
    .toast-info    { border-left: 3px solid #3498db; }

    .toast-icon { font-size: 1.1rem; }
    .toast-msg  { flex: 1; line-height: 1.4; }
    .toast-close {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      font-size: 0.75rem;
      padding: 2px;
      flex-shrink: 0;
      &:hover { color: var(--color-text); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class NotificationComponent {
  notif = inject(NotificationService);

  icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
}
