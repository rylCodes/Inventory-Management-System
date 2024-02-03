import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription, Subject, Observable, forkJoin } from 'rxjs';
import { faPen, faTrashCan, faXmark, faBell, faBellSlash, faEllipsisVertical, faSort } from '@fortawesome/free-solid-svg-icons';
import { Notification } from 'src/app/interface/Notification';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { Menu, Product } from 'src/app/interface/Product';
import { ToastrService } from 'ngx-toastr';
import { OwnerService } from 'src/app/services/owner/owner.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  @ViewChild('tableSettings', {static: true}) tableSettings: any;

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
  }

  isLoading: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faBell = faBell;
  faBellSlash = faBellSlash;
  faEllipsisVertical = faEllipsisVertical;
  faSort = faSort;
}
