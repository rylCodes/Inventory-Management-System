import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const toastrService = inject(ToastrService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  toastrService.error("Login required!");
  
  router.navigate(["login"]);
  return false;
};
