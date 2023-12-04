import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { faRightFromBracket, faXmark, faUserCircle, faBell, faBars, faMagnifyingGlass, faTimes, faHouse, faBoxesStacked, faList, faDesktop, faWallet, faCreditCard, faCircleInfo, faHandshake } from '@fortawesome/free-solid-svg-icons';

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
    };

    if(!(event.target as HTMLElement).closest('.menu-icon')) {
      this.isHidden = true;
    };
  }

  title = 'RylCodes-IMS';

  logOutIcon = faRightFromBracket;
  faXmark = faXmark;
  faUserCircle = faUserCircle;
  faBell = faBell;
  faBars = faBars;
  faMagnifyingGlass = faMagnifyingGlass;
  faTimes = faTimes;
  faHouse = faHouse;
  faBoxesStacked = faBoxesStacked;
  faList = faList;
  faDesktop = faDesktop;
  faWallet = faWallet;
  faHandshake = faHandshake;
  faCreditCard = faCreditCard;
  faCircleInfo = faCircleInfo;

  showLogOutActionModal: boolean = false;
  showUserDetails: boolean = false;

  isHidden: boolean = true;

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

  toggleNavigation() {
    this.isHidden = !this.isHidden;
  }

  getUser(): string | null {
    this.user = this.authService.getUserName();
    return this.user;
  }
}
