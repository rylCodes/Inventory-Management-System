import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { faRightFromBracket, faXmark, faUserCircle, faBell, faBars, faMagnifyingGlass, faTimes, faHouse, faBoxesStacked, faList, faDesktop, faWallet, faCreditCard, faCircleInfo, faHandshake } from '@fortawesome/free-solid-svg-icons';
import { StocksService } from 'src/app/services/stocks/stocks';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { Stock } from 'src/app/interface/Stock';
import { Notification } from 'src/app/interface/Notification';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
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

    if(!(event.target as HTMLElement).closest('.notif-icon')) {
      this.showNotifications = false;
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
  showNotifications: boolean = false;
  showUserDropDown: boolean = false;

  isHidden: boolean = true;

  user: string | null = null;
  notifCount: number | null = null;
  notifMessage: string = "";

  stocks: Stock[] = [];
  lowQtyStocks: Stock[] = [];
  notifications: Notification[] = [];

  notification: Notification = {
    id: undefined,
    content: "",
    timestamp: "",
    is_read: false,
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private stocksService: StocksService,
    ) {}
  
  ngOnInit(): void {
    this.stocksService.getStocks()
    .subscribe((stocks) => {
      this.stocks = stocks;
      this.lowQtyStocks = stocks.filter(stock => stock.quantity < 10);
    });
  }

  resetNotification() {
    this.notification = {
      id: undefined,
      content: "",
      timestamp: "",
      is_read: false,
    }
  }

  logOut() {
    this.authService.clearToken();
    this.router.navigate(["login"]);
  }

  toggleLogOutActionModal() {
    this.showLogOutActionModal = !this.showLogOutActionModal;
  }

  toggleNavigation() {
    this.isHidden = !this.isHidden;
  }

  toggleUserDropDown() {
    this.showUserDropDown = !this.showUserDropDown;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showUserDropDown = true;
      this.showUserDetails = false;
    } else {
      this.showUserDropDown = false;
    }
  }

  toggleUserDetails() {
    this.showUserDetails = !this.showUserDetails;
    if (this.showUserDetails) {
      this.showUserDropDown = true;
      this.showNotifications = false;
    } else {
      this.showUserDropDown = false;
    }
  }

  getUser(): string | null {
    this.user = this.authService.getUserName();
    return this.user;
  }
}
