import { Component } from '@angular/core';
import { faMagnifyingGlass, faTimes, faHouse, faBoxesStacked, faList, faDesktop, faWallet, faCreditCard, faCircleInfo, faHandshake } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
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

  searchQuery: string | null = null;
  filterText: string | null = null;
  isFilter: boolean = false;

  onSearch() {
    this.filterText = this.searchQuery
    this.isFilter = true;
    this.searchQuery = null;
  }

  clearSearch() {
    this.filterText = null;
    this.isFilter = false;
  }

}
