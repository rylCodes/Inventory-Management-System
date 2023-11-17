import { Component } from '@angular/core';
import { faMagnifyingGlass, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  faMagnifyingGlass = faMagnifyingGlass;
  faTimes = faTimes;

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
