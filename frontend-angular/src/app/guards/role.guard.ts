import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const role = authService.getRole();

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles && role && allowedRoles.includes(role)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
