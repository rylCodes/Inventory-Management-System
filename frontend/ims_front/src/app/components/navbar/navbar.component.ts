import { Component } from '@angular/core';

import {
  faMagnifyingGlass, faTimes, faHouse, faBoxesStacked,
  faList, faDesktop, faCreditCard, faCircleInfo, faAddressCard,
  faBoxesPacking, faXmark, faRightFromBracket, faMoneyBillTrendUp,
} from '@fortawesome/free-solid-svg-icons';

import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { RotateProp } from '@fortawesome/fontawesome-svg-core';
import { Subject } from 'rxjs';
import { UiService } from 'src/app/services/ui/ui.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  title: string = "Invenia+";

  showLogOutActionModal: boolean = false;

  faMagnifyingGlass = faMagnifyingGlass;
  faTimes = faTimes;
  faHouse = faHouse;
  faBoxesStacked = faBoxesStacked;
  faList = faList;
  faDesktop = faDesktop;
  faMoneyBillTrendUp = faMoneyBillTrendUp;
  faBoxesPacking = faBoxesPacking;
  faCreditCard = faCreditCard;
  faCircleInfo = faCircleInfo;
  logOutIcon = faRightFromBracket;
  faXmark = faXmark;
  faAddressCard = faAddressCard;

  searchQuery: string= "";
  filterText: string= "";
  isFilter: boolean = false;

  constructor (private authService: AuthService, private router: Router, uiService: UiService) {}

  toggleLogOutActionModal() {
    this.showLogOutActionModal = !this.showLogOutActionModal;
  }

  logOut() {
    this.authService.clearToken();
    location.href = '/#/login';
  }

}
