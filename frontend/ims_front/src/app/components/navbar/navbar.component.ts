import { Component } from '@angular/core';
import { faMagnifyingGlass, faTimes, faHouse, faBoxesStacked, faList, faDesktop, faWallet, faCreditCard, faCircleInfo, faHandshake, faXmark, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { RotateProp } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  title: string = "RylCodes-IMS";

  showLogOutActionModal: boolean = false;

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
  faXmark = faXmark;
  logOutIcon = faRightFromBracket;

  searchQuery: string | null = null;
  filterText: string | null = null;
  isFilter: boolean = false;

  constructor (private authService: AuthService, private router: Router) {}

  onSearch() {
    this.filterText = this.searchQuery
    this.isFilter = true;
    this.searchQuery = null;
  }

  clearSearch() {
    this.filterText = null;
    this.isFilter = false;
  }

  toggleLogOutActionModal() {
    this.showLogOutActionModal = !this.showLogOutActionModal;
  }

  logOut() {
    this.authService.clearToken();
    this.router.navigate(["login"]);
  }

}
