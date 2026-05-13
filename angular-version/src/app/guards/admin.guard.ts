import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.waitUntilReady();

  const user = authService.currentUser();
  if (user && user.type === 'admin') {
    return true;
  }

  // Si no es admin, redirigir a la home o mostrar error
  return router.createUrlTree(['/']);
};
