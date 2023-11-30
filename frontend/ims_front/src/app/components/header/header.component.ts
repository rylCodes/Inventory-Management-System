import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { faRightFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  title = 'RylCodes-IMS';
  logOutIcon = faRightFromBracket;
  faXmark = faXmark;
  showLogOutActionModal: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showLogOutActionModal) {
        this.toggleLogOutActionModal();
      }
    }
  }

  logOut() {
    this.authService.logout();
    this.router.navigate(["login"]);
  }

  toggleLogOutActionModal() {
    this.showLogOutActionModal = !this.showLogOutActionModal;
  }
}
