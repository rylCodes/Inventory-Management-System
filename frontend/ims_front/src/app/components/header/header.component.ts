import { Component, HostListener, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import {
  faRightFromBracket, faXmark, faUserCircle, faBell, faBars, faEllipsis,
  faMagnifyingGlass, faTimes, faHouse, faBoxesStacked, faList, faCheck,
  faDesktop, faMoneyBillTrendUp, faCreditCard, faCircleInfo, faBoxesPacking, faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { Stock } from 'src/app/interface/Stock';
import { Notification } from 'src/app/interface/Notification';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { UiService } from 'src/app/services/ui/ui.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('notifcontainer', {static: true}) notifContainer: any;
  @ViewChild('notifoption', {static: true}) notifoption: any;

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showLogOutActionModal) {
        this.showLogOutActionModal = false;
      } else if (this.showDelAllNotifModal) {
        this.showDelAllNotifModal = false;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if(!(event.target as HTMLElement).closest('#notifcontainer')) {
      this.showUserDetails = false;
      this.showNotifications = false;
    };

    if(!(event.target as HTMLElement).closest('#notifoption')) {
      this.showNotifOption = false;
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
  faMoneyBillTrendUp = faMoneyBillTrendUp;
  faBoxesPacking = faBoxesPacking;
  faCreditCard = faCreditCard;
  faCircleInfo = faCircleInfo;
  faEllipsis = faEllipsis;
  faCheck = faCheck;
  faTrashCan = faTrashCan;

  showLogOutActionModal: boolean = false;
  showDelAllNotifModal: boolean = false;
  showUserDetails: boolean = false;
  showNotifications: boolean = false;
  showUserDropDown: boolean = false;
  showNotifOption: boolean = false;

  isNotificationClicked: boolean = false;
  isNotifServiceInUse: boolean = false;
  isHidden: boolean = true;

  notificationSubscription: Subscription = new Subscription();
  notifServiceSubscription: Subscription;

  user: string | null = null;
  notifCount: number | null = null;
  notifMessage: string = "";

  stocks: Stock[] = [];
  lowStocks: Stock[] = [];
  critStocks: Stock[] = [];
  prevLowStocks: Stock[] = [];
  prevCritStocks: Stock[] = [];

  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];

  notification: Notification = {
    id: undefined,
    content: "",
    timestamp: "",
    is_read: false,
    warning_type: ""
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private stocksService: StocksService,
    private notificationService: NotificationsService,
    private uiService: UiService,
    private toastrService: ToastrService,
    ) { this.notifServiceSubscription = this.notificationService.notifServiceStatus$
      .subscribe((status) => {
        if (status) {
          this.isNotificationClicked = false; 
          this.ngOnInit();
        }
      })
    }
  
  checkNotifClick(event: Event) {
    const currentTarget = event.currentTarget as HTMLElement;
    const notifContainer = this.notifContainer.nativeElement as HTMLElement;
    if (currentTarget !== notifContainer) {
    }
  }

  ngOnInit(): void {
    // this.loadStocks();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.notificationSubscription.unsubscribe();
    this.notifServiceSubscription.unsubscribe();
  }

  loadNotifications() {
    this.notificationSubscription = this.notificationService.fetchNotifications()
    .subscribe((notifications: Notification[]) => {
      this.notifications = notifications;
      this.unreadNotifications = notifications.filter(notif => !notif.is_read);
    });
  }

  async loadStocks() {
    this.stocksService.getStocks()
    .subscribe((stocks) => {
      this.stocks = stocks.filter(stock => stock.status);
      this.lowStocks = this.stocks.filter(stock => stock.quantity <= 20 && stock.quantity > 5);
      this.critStocks = this.stocks.filter(stock => stock.quantity <= 5);

    });
  }

  addNotification() {
    if (this.critStocks.length) {
      this.critStocks.map(stock => {
        this.notification.content = `Warning: You only have ${stock.quantity} of ${stock.stock_name}.`;
        const newNotif = {
          ...this.notification
        }
        this.notificationService.addNotification(newNotif)
        .subscribe(() => {
          this.resetNotification();
          this.loadStocks();
        });
      });
    };
  }

  resetNotification() {
    this.notification = {
      id: undefined,
      content: "",
      timestamp: "",
      is_read: false,
      warning_type: ""
    }
  }

  logOut() {
    this.authService.clearToken();
    this.router.navigate(["login"]);
  }

  toggleLogOutActionModal() {
    this.showLogOutActionModal = !this.showLogOutActionModal;
  }

  toggleDelAllNotifModal() {
    if (this.notifications.length < 1) {
      this.showNotifOption = false;
    } else {
      this.showDelAllNotifModal = !this.showDelAllNotifModal;
    }
  }

  toggleNavigation() {
    this.isHidden = !this.isHidden;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.isNotificationClicked = true;
    if (this.showNotifications) {
      this.showUserDetails = false;
    }
  }

  toggleUserDetails() {
    this.showUserDetails = !this.showUserDetails;
    if (this.showUserDetails) {
      this.showNotifications = false;
    }
  }

  toggleNotifOption() {
    this.showNotifOption = !this.showNotifOption
  }

  getUser(): string | null {
    this.user = this.authService.getUserName();
    return this.user;
  }

  markAsRead(notif: Notification) {
    this.notification = notif;

    if (notif.is_read) {
      return;
    } else {
      this.notification.is_read = true;
      const updatingNotif = {
        ...this.notification
      }

    this.notificationService.updateNotification(updatingNotif)
    .subscribe(notification => {
      const index = this.notifications.findIndex(notif => notification.id === notif.id);
      this.notifications[index] = notification;
      this.resetNotification();
    })
    }
  }

  deleteEachNotif(notif: Notification) {
    this.notificationService.deleteNotification(notif).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(notification => {
          notification.id !== notif.id;
        });
        this.loadNotifications();
      },
      error: (err) => this.uiService.displayErrorMessage(err)
    });
  }

  deleteAllNotifs() {
    if (this.notifications.length < 1) {
      this.showNotifOption = false;
      return;
    }

    let deletingNotifs: Observable<Notification>[] = [];

    this.notifications.forEach(notif => {
      deletingNotifs.push(this.notificationService.deleteNotification(notif));
    });

    forkJoin(deletingNotifs).subscribe({
      next: () => {
        this.showDelAllNotifModal = false;
        this.loadNotifications();
        this.toastrService.success("Success: All notifications are now deleted.");  
      },
      error: err => {
        this.showDelAllNotifModal = false;
        this.uiService.displayErrorMessage(err)
      },
    })
  }

  markAllAsRead() {
    if (this.unreadNotifications.length < 1) {
      this.showNotifOption = false;
      return;
    }

    let markingAllNotifsAsRead: Observable<Notification>[] =[];

    this.unreadNotifications.forEach(notif => {
      notif.is_read = true;
      markingAllNotifsAsRead.push(this.notificationService.updateNotification(notif));
    });

    forkJoin(markingAllNotifsAsRead).subscribe({
      next: async() => {
        this.showNotifOption = false;
        this.toastrService.success("Success: All notifications are now marked as read.");  
      },
      error: err => this.uiService.displayErrorMessage(err),
    });

  }
}
