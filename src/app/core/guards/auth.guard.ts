import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.currentUser) {
    return true;
  }

  // Mantén la URL destino para después de login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
