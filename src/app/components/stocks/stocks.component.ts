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

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css'],
})
export class StocksComponent implements OnInit {
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

  deletingStock?: Stock | null = null;
  proceedEdit: boolean = false;
  isLoading: boolean = false;
  isFetching: boolean = false;

  showSearchBar: boolean = false;
  showTableSettings: boolean = true;
  showSortOrDelItems: boolean = false;
  showForm: boolean = false;
  showModal: boolean = false;
  showActionModal: boolean = false;

  actionModalSubscription: Subscription = new Subscription;
  formSubscription: Subscription = new Subscription;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faBell = faBell;
  faBellSlash = faBellSlash;
  faEllipsisVertical = faEllipsisVertical;
  faSort = faSort;

  stocks: Stock[] = [];
  stocksToCheck: Stock[] = [];
  menus: Menu[] = [];
  products: Product[] = [];
  notifications: Notification[] = [];

  currentDate = new Date();

  stock: Stock = {
    id: undefined,
    code: "",
    stock_name: "",
    description: "",
    quantity: 0,
    unit: "",
    status: true,
    show_notification: true,
  }

  originalStock: Stock = {
    id: undefined,
    code: "",
    stock_name: "",
    description: "",
    quantity: 0,
    unit: "",
    status: true,
    show_notification: true,
  }

  customUnit: string = "";

  notification: Notification = {
    id: undefined,
    content: "",
    timestamp: "",
    is_read: false,
    warning_type: ""
  }

  constructor(
    private stockService: StocksService,
    private uiService: UiService,
    private notifService: NotificationsService,
    private productService: ProductsService,
    private toastrService: ToastrService,
    ) {}

  resetNotification() {
    this.notification = {
      id: undefined,
      content: "",
      timestamp: "",
      is_read: false,
      warning_type: ""
    }
  }

  resetForm() {
    this.stock = {
      id: undefined,
      code: "",
      stock_name: "",
      description: "",
      quantity: 0,
      unit: "",
      status: true,
      show_notification: true,
    }

    this.customUnit = "";
  }

  toggleForm() {    
    this.showForm = !this.showForm;
    this.showTableSettings = false;
    this.showSearchBar = false;
    if (!this.showForm) {
      this.showTableSettings = true;
      this.proceedEdit = false;
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW STOCKS
  ngOnInit(): void {
    this.loadNotifications();
    this.loadProducts();
    this.loadMenus();
    this.loadStocks();
  }

  loadNotifications(): void {
    this.notifService.getNotifications().subscribe({
      next: notifs => this.notifications = notifs,
      error: err => console.log("Failed to fetch notifications", err),
    })
  }

  loadStocks(): void {
    this.isFetching = true;
    this.stockService
      .getStocks(this.filterText)
      .subscribe({
        next: (stocks) => {
          this.isFetching = false;
          this.stocks = stocks;
          this.stocksToCheck = stocks.filter(stock => stock.show_notification);
        },
        error: (err) => {
          this.isFetching = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  loadMenus(): void {
    this.productService.getMenus()
    .subscribe(menus => this.menus = menus);
  }

  loadProducts(): void {
    this.productService.getProducts()
    .subscribe(products => this.products = products);
  }

  onSubmit() {
    if (this.proceedEdit) {
      this.saveUpdate();
    } else {
      this.addStock();
    }
  }

  // CREATE STOCK
  addStock() {
    if (!this.stock.stock_name) {
      this.toastrService.error("Enter stock name!");
      return;
    } else if (this.stock.quantity < 0 || this.stock.quantity === null) {
      this.toastrService.error("Invalid stock quantity!");
      return;
    }

    if (this.stock.unit === "otherUnit" && this.customUnit) {
      this.stock.unit = this.customUnit;
    }

    const newStock = {
      ...this.stock,
      stock_name: this.stock.stock_name.toUpperCase(),
      description: this.stock.description.toUpperCase(),
    }

    const isStockNameExist = this.stocks.some(stock => stock.stock_name === newStock.stock_name);
  
    if (isStockNameExist) {
      this.toastrService.error("Stock with this name already exists!");
    } else {
      this.isLoading = true;
      this.stockService.addStock(newStock)
      .subscribe({
        next: async (stock) => {
          this.isLoading = false;
          this.stocks.push(stock);
          this.toggleForm();
          await this.uiService.wait(100);
          this.toastrService.success("New stock has been created successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
    }
  }

  // UPDATE STOCK
  updateStock(stock: Stock) {
    this.proceedEdit = true;
    this.stock = { ...stock };
    this.originalStock = { ...stock };
    this.toggleForm();
  }

  saveUpdate() {
    if (!this.stock.stock_name) {
      this.toastrService.error("Enter stock name!");
      return;
    } else if (this.stock.quantity === null) {
      this.toastrService.error("Invalid stock quantity!");
      return;
    }

    if (JSON.stringify(this.originalStock) === JSON.stringify(this.stock)) {
      this.toggleForm();
      return;
    }

    if (this.stock.unit === "otherUnit" && this.customUnit) {
      this.stock.unit = this.customUnit;
    }

    const editingStock = {
      ...this.stock,
      stock_name: this.stock.stock_name.toUpperCase(),
      description: this.stock.description.toUpperCase(),
    }

    const isStockNameExist = this.stocks.some(stock => stock.id !== editingStock.id && stock.stock_name === editingStock.stock_name);

    if (isStockNameExist) {
      this.toastrService.error("Stock with this name already exists!");
      return;
    } else {
        this.stockService
        .editStock(editingStock)
        .subscribe({
          next: async (stockData) => {
            this.updateRelatedMenu(stockData);
            this.isLoading = false;
            const index = this.stocks.findIndex(stock => stock.id === stockData.id);
            this.stocks[index] = stockData;
            this.loadStocks();
            this.toggleForm();

            await this.uiService.wait(100);
            if (stockData.quantity < 0) {
              this.toastrService
              .warning(
                "Please verify if the product's quantity is correct.",
                "Negative Quantity!",
                {timeOut: 5000}
              );
            }
            this.toastrService.success("Successfully saved changes to the stock.");
          },
          error: (err) => {
            this.isLoading = false;
            this.uiService.displayErrorMessage(err);
          }
        });
    }
  }

  // DELETE STOCK
  deleteStock(stock: Stock) {
    this.deletingStock = stock;
    this.toggleActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingStock) {
      return;
    }

    this.isLoading = true;
    this.stockService
      .deleteStock(this.deletingStock)
      .subscribe({
        next: async () => {
          this.isLoading = false
          this.stocks = this.stocks.filter(s => s.id !== this.deletingStock?.id);
          this.deletingStock = null;
          this.toggleActionModal()
          await this.uiService.wait(100);
          this.toastrService.success("Stock has been deleted successfully!");
        },
        error: (err) => {
          if (err) {
            this.isLoading = false;
            this.uiService.displayErrorMessage(err);
            this.toggleActionModal();
          }
        }
      });
  }
  

  updateRelatedMenu(stock: Stock) {
    const relatedProducts = this.products.filter(product => product.stock_id === stock.id);
    const relatedMenu = this.menus.filter(menu => {
      return relatedProducts.some(product => product.menu === menu.id);
    });

    if (!stock.status) {
      relatedMenu.map(menu => {
        menu.status = false;
        this.productService.updateMenu(menu).subscribe();
      });
    } else {
      relatedMenu.map(menu => {
        menu.status = true;
        this.productService.updateMenu(menu).subscribe();
      });
    }
  }

  onSearch() {
    if (this.searchQuery) {
      this.filterText = this.searchQuery
      this.isFilter = true;
      this.searchQuery = "";
      this.setQuery(this.filterText)

      if (!this.stocks.length) {
        return;
      } else {
        this.loadStocks();
      }
    }
  }

  removeFilter() {
    this.filterText = "";
    this.searchQuery = "";
    this.isFilter = false;
    this.loadStocks();
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
    
    if (this.stocks.length) {
      this.toastrService.warning('Caution: All items will be deleted permanently!', undefined, { timeOut: 5000});
    }
  }

  onConfirmDeleteAll() {
    if (!this.stocks.length) {
      this.showModal = false;
      return;
    }
    
    let deletingStocks: Observable<Stock>[] = [];

    this.stocks.forEach(stock => {
      deletingStocks.push(this.stockService.deleteStock(stock));
    });

    forkJoin(deletingStocks).subscribe({
      next: () => {
        this.loadStocks();
        this.showModal = false;
        this.toastrService.success("All items has been deleted successfully.");
      },
      error: (err) => {
        this.showModal = false;
        this.uiService.displayErrorMessage(err);
      }
    })
  }

  sortItemsByDate() {
    this.stocks.sort((a, b): any => {
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
    this.stocks.sort((a, b): any => {
      if (a.stock_name && b.stock_name) {
        let comparison = a.stock_name.localeCompare(b.stock_name);
  
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