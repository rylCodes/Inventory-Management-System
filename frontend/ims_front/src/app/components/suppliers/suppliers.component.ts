import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Supplier } from 'src/app/interface/Supplier';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription, Subject, Observable, forkJoin } from 'rxjs';
import { faPen, faTrashCan, faXmark, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { EmailValidator } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  @ViewChild('tableSettings', {static: true}) tableSettings: any;

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if(!(event.target as HTMLElement).closest('#tableSettings')) {
      this.showSortOrDelItems = false;
    };
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showActionModal) {
        this.showActionModal = false;
      } else if (this.showSearchBar) {
        this.showSearchBar = false;
      }
    }
  }

  private query = new Subject<string>();
  searchQuery: string = "";
  filterText: string= "";
  isFilter: boolean = false;
  isAscending: boolean = true;
  isSortedAToZ: boolean = true;

  deletingSupplier?: Supplier | null = null;
  proceedEdit: boolean = false;

  isLoading: boolean = false;
  isFetching: boolean = false;

  showSearchBar: boolean = false;
  showTableSettings: boolean = true;
  showSortOrDelItems: boolean = false;
  showForm: boolean = false;
  showModal: boolean = false;
  showActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faEllipsisVertical = faEllipsisVertical;

  suppliers: Supplier[] = [];

  supplier: Supplier = {
    id: undefined, 
    code: undefined,
    name: "",
    phone: "",
    address: "",
    email: "",
    date_added: undefined,
    date_updated: undefined,
    status: true,
  }

  constructor(
    private supplierService: SuppliersService,
    private uiService: UiService,
    private toastrService: ToastrService,
    ) {}

  validateEmail(email: string): boolean {
    const emailPattern: RegExp = /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  resetForm() {
    this.supplier.name = "";
    this.supplier.address = "";
    this.supplier.phone = "";
    this.supplier.email = "";
    this.supplier.status = true;
  }

  toggleForm() {    
    this.showForm = !this.showForm;
    this.toggleTableSettings();
    if (!this.showForm) {
      this.proceedEdit = false;
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW SUPPLIERS
  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isFetching = true;
    this.supplierService
    .getSuppliers(this.filterText)
    .subscribe({
      next: (suppliers) => {
        this.isFetching = false;
        this.suppliers = suppliers;
      },
      error: (err) => {
        this.isFetching = false;
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  onSubmit() {
    if (this.proceedEdit) {
      this.saveUpdate();
    } else {
      this.addSupplier();
    }
  }

  // CREATE SUPPLIER
  addSupplier() {
    if (!this.supplier.name) {
      this.toastrService.error("Enter supplier!")
      return;
    }

    const newSupplier = {
      id: this.supplier.id,
      code: this.supplier.code,
      name: this.supplier.name.toUpperCase(),
      address: this.supplier.address.toUpperCase(),
      phone: this.supplier.phone,
      email: this.supplier.email,
      date_added: this.supplier.date_added,
      date_updated: this.supplier.date_updated,
      status: this.supplier.status,
    }

    const isSupplierExist = this.suppliers.some(supplier => supplier.name == newSupplier.name);
    const isPhoneExist = this.suppliers.some(supplier => supplier.phone && supplier.phone == newSupplier.phone);
    const isEmailExist = this.suppliers.some(supplier => supplier.email && supplier.email == newSupplier.email);
  
    if (isSupplierExist) {
      this.toastrService.error("Supplier with this name already exists!")
    } else if (isPhoneExist) {
      this.toastrService.error("Supplier with this phone already exists!")
    } else if (isEmailExist) {
      this.toastrService.error("Supplier with this email already exists!")
    } else if (newSupplier.email && !this.validateEmail(newSupplier.email)) {
      this.toastrService.error("Enter valid email!")
    } else {
      this.isLoading = true;
      this.supplierService.addSupplier(newSupplier)
      .subscribe({
        next: async (Supplier) => {
          this.isLoading = false;
          this.toggleForm();
          this.toastrService.success("New supplier has been created successfully!")
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
    }
  }

// UPDATE SUPPLIER
updateSupplier(supplier: Supplier) {
  this.proceedEdit = true;
  this.supplier.id = supplier.id;
  this.supplier.code = supplier.code;
  this.supplier.name = supplier.name.toUpperCase();
  this.supplier.address = supplier.address.toUpperCase();
  this.supplier.phone = supplier.phone;
  this.supplier.email = supplier.email;
  this.supplier.status = supplier.status;
  this.toggleForm();
}

saveUpdate() {
  const editingSupplier = {
    id: this.supplier.id,
    code: this.supplier.code,
    name: this.supplier.name.toUpperCase(),
    address: this.supplier.address.toUpperCase(),
    phone: this.supplier.phone,
    email: this.supplier.email,
    date_added: this.supplier.date_added,
    date_updated: this.supplier.date_updated,
    status: this.supplier.status,
  }

  const isSupplierExist = this.suppliers.some(supplier => supplier.id !== editingSupplier.id && supplier.name === editingSupplier.name);
  const isPhoneExist = this.suppliers.some(supplier => supplier.phone && supplier.id !== editingSupplier.id && supplier.phone === editingSupplier.phone);
  const isEmailExist = this.suppliers.some(supplier => supplier.email && supplier.id !== editingSupplier.id && supplier.email === editingSupplier.email);

  if (isSupplierExist) {
    this.toastrService.error("Supplier with this name already exists!")
  } else if (isPhoneExist) {
    this.toastrService.error("Supplier with this phone already exists!")
  } else if (isEmailExist) {
    this.toastrService.error("Supplier with this email already exists!")
  } else if (editingSupplier.email && !this.validateEmail(editingSupplier.email)) {
    this.toastrService.error("Enter valid email!")
  } else {
      this.isLoading = true;
      this.supplierService
      .editSupplier(editingSupplier)
      .subscribe({
        next: async (supplierData) => {
          const index = this.suppliers.findIndex(supplier => supplier.id === supplierData.id);
          this.suppliers[index] = supplierData;
          this.toggleForm();
          this.toastrService.success("Successfully saved changes to the supplier.")
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
    }
  }

  // DELETE SUPPLIER
  deleteSupplier(supplier: Supplier) {
    this.deletingSupplier = supplier;
    this.toggleActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingSupplier) {
      return;
    }
    this.isLoading = true;
    this.supplierService
    .deleteSupplier(this.deletingSupplier)
    .subscribe({
      next: async () => {
        this.isLoading = false;
        this.suppliers = this.suppliers.filter(s => s.id !== this.deletingSupplier?.id);
        this.deletingSupplier = null;
        this.showActionModal = false;
        this.toastrService.success("Supplier has been deleted successfully!")
      },
      error: (err) => {
        this.isLoading = false;
        this.showActionModal = false;
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  onSearch() {
    if (this.searchQuery) {
      this.filterText = this.searchQuery
      this.isFilter = true;
      this.searchQuery = "";
      this.setQuery(this.filterText)

      if (!this.suppliers.length) {
        return;
      } else {
        this.loadSuppliers();
      }
    }
  }

  removeFilter() {
    this.filterText = "";
    this.searchQuery = "";
    this.isFilter = false;
    this.loadSuppliers();
  }

  setQuery(query: string) {
    this.query.next(query);
  }

  clearText() {
    this.filterText = "";
    this.searchQuery = "";
  }

  onSearchChanged(value: string): void {
    console.log(value)
    this.searchQuery = value;
  }

  toggleShowSearchBar() {
    this.showSearchBar = !this.showSearchBar;
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  toggleTableSettings() {
    this.showTableSettings = !this.showTableSettings;
  }

  toggleSortOrDelItems() {
    this.showSortOrDelItems = !this.showSortOrDelItems
  }

  deleteAllItems() {
    this.showSortOrDelItems = false;
    this.toggleModal();
    
    if (this.suppliers.length) {
      this.toastrService.warning('Caution: All suppliers will be deleted permanently!', undefined, { timeOut: 5000});
    }
  }

  onConfirmDeleteAll() {
    if (!this.suppliers.length) {
      this.showModal = false;
      return;
    }
    
    let deletingSuppliers: Observable<Supplier>[] = [];

    this.suppliers.forEach(stock => {
      deletingSuppliers.push(this.supplierService.deleteSupplier(stock));
    });

    forkJoin(deletingSuppliers).subscribe({
      next: () => {
        this.loadSuppliers();
        this.showModal = false;
        this.toastrService.success("All suppliers has been deleted successfully.");
      },
      error: (err) => {
        this.showModal = false;
        this.uiService.displayErrorMessage(err);
      }
    })
  }

  sortItemsByDate() {
    this.suppliers.sort((a, b): any => {
      if (a.date_updated && b.date_updated) {
        const dateA = Date.parse(a.date_updated);
        const dateB = Date.parse(b.date_updated)
        let comparison = dateA - dateB;

        if (!this.isAscending) {
          comparison *= -1;
        }

        return comparison;
      }
    });

    this.toggleSortOrDelItems();
    this.isAscending = !this.isAscending;
  }

  sortItemsByName() {
    this.suppliers.sort((a, b): any => {
      if (a.name && b.name) {
        let comparison = a.name.localeCompare(b.name);
  
        if (!this.isSortedAToZ) {
          comparison *= -1;
        }
  
        return comparison;
      }
    });
  
    this.toggleSortOrDelItems();
    this.isSortedAToZ = !this.isSortedAToZ;
  }

  // ** Class ends here. **
}