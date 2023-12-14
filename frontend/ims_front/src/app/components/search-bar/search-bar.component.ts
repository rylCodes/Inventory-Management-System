import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faMagnifyingGlass, faTimes, faXmark, faFilter } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { RotateProp } from '@fortawesome/fontawesome-svg-core';
import { Subject } from 'rxjs';
import { UiService } from 'src/app/services/ui/ui.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent {
  @Output() search = new EventEmitter();
  @Output() removeFilter = new EventEmitter();
  @Output() clearText = new EventEmitter();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() btnClick = new EventEmitter();

  @Input() isFilter: boolean = false;
  @Input() showSearchBar: boolean = false;
  @Input() filterText: string = "";
  @Input() searchQuery: string = '';

  showLogOutActionModal: boolean = false;

  faMagnifyingGlass = faMagnifyingGlass;
  faTimes = faTimes;
  faXmark = faXmark;
  faFilter = faFilter;

  constructor (private authService: AuthService, private router: Router, uiService: UiService) {}

  onSearch() {
    this.search.emit();
  }

  onClick() {
    this.btnClick.emit();
  }

  onRemoveFilter() {
    this.removeFilter.emit();
  }

  onClearText() {
    this.clearText.emit();
  }

  onInputChange() {
    this.searchChanged.emit(this.searchQuery);
  }

}
