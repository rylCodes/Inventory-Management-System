import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  title = 'RylCodes-IMS';

  constructor(private authService: AuthService, private router: Router) {}

  logOut() {
    this.authService.logout();
    this.router.navigate(["login"]);
  }
}
