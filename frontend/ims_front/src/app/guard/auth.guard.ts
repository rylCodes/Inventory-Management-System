import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const toastrService = inject(ToastrService);
  const router = inject(Router);

  const currentRoute = state.url || '';

  if (authService.isAuthenticated()) {
    return true;
  }

  if (currentRoute === '/login' || currentRoute === '/') {
    router.navigate(["login"]);
    return false;
  }

  toastrService.error("Login required!");
  router.navigate(["login"]);
  return false;
};
