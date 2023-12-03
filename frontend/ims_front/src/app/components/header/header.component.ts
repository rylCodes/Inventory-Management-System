import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { faRightFromBracket, faXmark, faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showLogOutActionModal) {
        this.toggleLogOutActionModal();
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if(!(event.target as HTMLElement).closest('.user-icon')) {
      this.showUserDetails = false;
    }
  }

  title = 'RylCodes-IMS';

  logOutIcon = faRightFromBracket;
  faXmark = faXmark;
  faUserCircle = faUserCircle;

  showLogOutActionModal: boolean = false;
  showUserDetails: boolean = false;

  user: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  logOut() {
    this.authService.clearToken();
    this.router.navigate(["login"]);
  }

  toggleLogOutActionModal() {
    this.showLogOutActionModal = !this.showLogOutActionModal;
  }

  toggleUserDetails() {
    this.showUserDetails = !this.showUserDetails;
  }

  getUser(): string | null {
    this.user = this.authService.getUserName();
    return this.user;
  }
}
