import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notif = inject(NotificationService);

  return next(req).pipe(
    catchError(err => {
      const status = err.status;
      if (status === 401) {
        authService.logout();
        router.navigate(['/login']);
      } else if (status === 403) {
        notif.error('No tienes permiso para realizar esta acción');
        router.navigate(['/']);
      } else if (status === 0) {
        notif.error('No se pudo conectar al servidor');
      }
      return throwError(() => err);
    })
  );
};
