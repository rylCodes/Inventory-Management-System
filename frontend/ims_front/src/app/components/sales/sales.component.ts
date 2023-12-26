import { Component, OnInit, Renderer2, HostListener, ViewChild } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Menu } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';

import {
  faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes,
  faPrint, faLocationDot, faPhone, faEnvelope, faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';

import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { Owner } from 'src/app/interface/Owner';
import { OwnerService } from 'src/app/services/owner/owner.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
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
      if (this.showItemActionModal) {
        this.showItemActionModal = false;
      } else if (this.showBillActionModal) {
        this.showBillActionModal = false;
      } else if (this.showInvoice) {
        this.showInvoice = false; 
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

  deletingSaleBill?: SaleBill | null = null;
  deletingSaleItem?: SaleItem | null = null;

  showModal: boolean = false;
  showSaveBillModal: boolean = false;
  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;
  showInvoice: boolean = false;

  showSearchBar: boolean = false;
  showTableSettings: boolean = true;
  showSortOrDelItems: boolean = false;
  showForm: boolean = false;
  showOrder: boolean = false;
  isFetching: boolean = false;
  isLoading: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faRectangleList = faRectangleList;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;
  faPrint = faPrint;
  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faEllipsisVertical = faEllipsisVertical;

  bills: SaleBill[] = [];
  allItems: SaleItem[] = [];
  eachBillItems: SaleItem[] = [];
  menus: Menu[] = [];
  stocks: Stock[] = [];
  amountChange: number = 0;

  bill: SaleBill = {
    id: undefined,
    billno: "",
    time: "",
    customer_name: "",
    remarks: "",
    amount_tendered: 0,
    grand_total: 0,
    mode_of_payment: "Cash",
    status: true,
  };

  item: SaleItem = {
    id: undefined,
    billno: undefined,
    menu: undefined,
    quantity: 0,
    price: 0,
    sale_date: "",
    sub_total: 0,
    status: true,
  }

  owner: Owner = {
    id: undefined,
    first_name: "",
    last_name: "",
    business_name: "",
    business_address: "",
    phone: "",
    email: "",
  };

  p: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
      private ownerService: OwnerService,
      private toastrService: ToastrService,
    ) {}

  resetBill() {
    this.bill = {
      billno: "",
      time: "",
      customer_name: "",
      remarks: "",
      amount_tendered: 0,
      grand_total: 0,
      mode_of_payment: "Cash",
      status: false,
    };
  }

  toggleBillActionModal() {
    this.showBillActionModal = !this.showBillActionModal;
  }

  toggleItemActionModal() {
    this.showItemActionModal = !this.showItemActionModal;
  }

  async toggleInvoice(bill: SaleBill) {
    this.bill = bill;
    const allBills = Array.from(this.bills);
    const allEachBillItems = Array.from(this.eachBillItems);

    await this.uiService.wait(100);
    this.bills = this.bills.filter(salesBill => salesBill.id === bill.id)
    this.eachBillItems = this.eachBillItems.filter(item => item.billno === bill.id);

    this.showInvoice = !this.showInvoice;
    if (this.showInvoice) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
      this.bills = allBills;
      this.eachBillItems = allEachBillItems;
      this.resetBill;
    }
  }

  // SHOW BILLS
  ngOnInit(): void {
    // this.loadAllItems();
    this.loadMenus();
    this.loadStocks();
    this.loadOwner();
    this.loadItems();
    this.loadBills();
  }  

  loadBills() {
    this.isFetching = true;
    this.salesService
    .getSaleBills(this.filterText)
    .subscribe({
      next: bills => {
        this.isFetching = false;
        this.bills = bills.filter(bill => bill.status);
        this.totalItems = this.bills.length;
      },
      error: (error) => {
        this.isFetching = false;
        this.uiService.displayErrorMessage(error);
      }
    });
  }

  loadItems() {
    this.salesService
    .getSaleItems()
    .subscribe({
      next: (items) => {
        this.allItems = Array.from(items);
        this.eachBillItems = items.filter(item => item.billno === this.bill.id);
      },
      error: (err) => console.log(err)
    });
  }

  // loadAllItems() {
  //   this.salesService
  //     .getSaleItems()
  //     .subscribe({
  //       next: (items) => this.allItems = items,
  //       error: (err) => console.log(err),
  //     });
  // }

  loadMenus() {
    this.productService
      .getMenus()
      .subscribe({
        next: menus => {
          const activeMenus = menus.filter(menu => menu.status === true);
          this.menus = activeMenus;
        },
        error: err => console.log(err),
      })
  }

  loadStocks() {
    this.stockService
      .getStocks()
      .subscribe({
        next: stocks => {
          const activeStocks = stocks.filter(stock => stock.status === true);
          this.stocks = activeStocks;
        },
        error: err => console.log(err),
      })
  }

  loadOwner() {
    this.ownerService
      .getOwners()
      .subscribe({
        next: owners => {
          this.owner = owners[0];
        },
        error: (err) => console.log(err)
      });
  }

  getItemLength(bill: SaleBill) {
    const items = this.allItems.filter(item => item.billno === bill.id);
    return items.length;
  }
  
  // DELETE BILL
  deleteSaleBill(saleBill: SaleBill) {
    this.deletingSaleBill = saleBill;
    this.toggleBillActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingSaleBill) {
      return;
    }

    this.isLoading = true;
    this.salesService
      .deleteSaleBill(this.deletingSaleBill)
      .subscribe({
        next: async () => {
          this.isLoading = false
          this.bills = this.bills.filter(s => s.id !== this.deletingSaleBill?.id);
          this.deletingSaleBill = null;
          this.toggleBillActionModal()
          await this.uiService.wait(100);
          this.toastrService.success("Transaction history has been deleted successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.showBillActionModal = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  // SHOW ITEMS
  getSaleBill(saleBillId: any): string {
    const foundSaleBill = this.bills.find(saleBill => saleBill.id === saleBillId);
    return foundSaleBill ? foundSaleBill.customer_name : 'Bill Not Found';
  }
  
  getMenuDetails(menuId: any): {name: string, code?: string, price: number} {
    const foundMenu = this.menus.find(menu => menu.id === menuId);
    if (foundMenu) {
      return {
        name: foundMenu.name,
        code: foundMenu.code,
        price: foundMenu.price,
      }
    } else {
      return {
        name: "Menu not found!",
        code: "Menu not found!",
        price: 0,
      }
    }
  }

  printReceipt(): void {
    window.print();
  }

  onSearch() {
    if (this.searchQuery) {
      this.filterText = this.searchQuery
      this.isFilter = true;
      this.searchQuery = "";
      this.setQuery(this.filterText)

      if (!this.bills.length) {
        return;
      } else {
        this.loadBills();
      }
    }
  }

  removeFilter() {
    this.filterText = "";
    this.searchQuery = "";
    this.isFilter = false;
    this.loadBills();
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

  toggleModal() {
    this.showModal = !this.showModal;
  }

  toggleShowSearchBar() {
    this.showSearchBar = !this.showSearchBar;
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
    
    if (this.bills.length) {
      this.toastrService.warning('Caution: All sales history will be deleted permanently!', undefined, { timeOut: 5000});
    }
  }

  onConfirmDeleteAll() {
    if (!this.bills.length) {
      this.showModal = false;
      return;
    }
    
    let deletingBills: Observable<SaleBill>[] = [];

    this.bills.forEach(bill => {
      deletingBills.push(this.salesService.deleteSaleBill(bill));
    });

    this.isLoading = true;
    forkJoin(deletingBills).subscribe({
      next: () => {
        this.isLoading = false;
        this.loadBills();
        this.showModal = false;
        this.toastrService.success("All sales history has been deleted successfully.");
      },
      error: (err) => {
        this.isLoading = false;
        this.showModal = false;
        this.uiService.displayErrorMessage(err);
      }
    })
  }

  sortItemsByDate() {
    this.bills.sort((a, b): any => {
      if (a.time && b.time) {
        const dateA = Date.parse(a.time);
        const dateB = Date.parse(b.time)
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
    this.bills.sort((a, b): any => {
      if (a.customer_name && b.customer_name) {
        let comparison = a.customer_name.localeCompare(b.customer_name);
  
        if (!this.isSortedAToZ) {
          comparison *= -1;
        }
  
        return comparison;
      }
    });

    this.toggleSortOrDelItems();
    this.isSortedAToZ = !this.isSortedAToZ;
  }
}