import { Component, HostListener, OnInit } from '@angular/core';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription } from 'rxjs';
import { faPen, faTrashCan, faXmark, faBell, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import { Notification } from 'src/app/interface/Notification';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { Menu, Product } from 'src/app/interface/Product';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css'],
})
export class StocksComponent implements OnInit {
  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showActionModal) {
        this.showActionModal = false;
      }
    }
  }

  searchQuery: string = "product";
  deletingStock?: Stock | null = null;
  proceedEdit: boolean = false;
  isLoading: boolean = false;
  isFetching: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faBell = faBell;
  faBellSlash = faBellSlash;

  stocks: Stock[] = [];
  stocksToCheck: Stock[] = [];
  menus: Menu[] = [];
  products: Product[] = [];

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

  showForm: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(
    private stockService: StocksService,
    private uiService: UiService,
    private notifService: NotificationsService,
    private productService: ProductsService,
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
    if (!this.showForm) {
      this.proceedEdit = false;
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW STOCKS
  ngOnInit(): void {
    this.loadProducts();
    this.loadMenus();
    this.loadStocks();
  }

  loadStocks(): void {
    this.isFetching = true;
    this.stockService
      .getStocks()
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
      window.alert("Enter stock name!");
      return;
    } else if (this.stock.quantity < 0 || this.stock.quantity === null) {
      window.alert("Invalid stock quantity!");
      return;
    }

    if (this.stock.unit === "otherUnit" && this.customUnit) {
      this.stock.unit = this.customUnit;
    }

    const newStock = {
      id: this.stock.id,
      code: this.stock.code,
      stock_name: this.stock.stock_name.toUpperCase(),
      description: this.stock.description.toUpperCase(),
      quantity: this.stock.quantity,
      unit: this.stock.unit,
      date_added: this.stock.date_added,
      date_updated: this.stock.date_updated,
      status: this.stock.status,
      show_notification: this.stock.show_notification,
    }

    const isStockNameExist = this.stocks.some(stock => stock.stock_name === newStock.stock_name);
  
    if (isStockNameExist) {
      window.alert("Stock with this name already exists!");
    } else {
      this.isLoading = true;
      this.stockService.addStock(newStock)
      .subscribe({
        next: async (stock) => {
          this.isLoading = false;
          this.stocks.push(stock);
          this.toggleForm();
          await this.uiService.wait(100);
          window.alert("New stock has been created successfully!");
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
      window.alert("Enter stock name!");
      return;
    } else if (this.stock.quantity === null) {
      window.alert("Invalid stock quantity!");
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
      window.alert("Stock with this name already exists!");
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
            
            if (stockData.show_notification) {
              this.addNotification();
            }

            await this.uiService.wait(100);
            if (stockData.quantity < 0) {
              window.alert("If the product quantity is correct, leave it unchanged. Please verify and correct if it's showing a negative value.")
            }
            window.alert("Successfully saved changes to the stock.");
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
          window.alert("Stock has been deleted successfully!");
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

  addNotification() {
    const critStocks = this.stocksToCheck.filter(stock => stock.quantity <= 5);
    const lowStocks = this.stocksToCheck.filter(stock => stock.quantity <= 20 && stock.quantity > 5);
    if (critStocks.length) {
      critStocks.forEach(stock => {
        this.notification.content = `${stock.quantity} ${stock.unit}/s of ${stock.stock_name} remaining.`;
        this.notification.warning_type = "Critical stock level";
        const newNotif = {
          ...this.notification
        }

        this.notifService.addNotification(newNotif)
        .subscribe(() => {
          this.resetNotification();
          this.notifService.setServiceStatus(true);
          console.log("New notification has been added successfully!");
        });
      });
    };
    
    if (lowStocks.length) {
      lowStocks.forEach(stock => {
        this.notification.content = `${stock.quantity} ${stock.unit}/s of ${stock.stock_name} remaining.`;
        this.notification.warning_type = "Low stock level";
        const newNotif = {
          ...this.notification
        }

        this.notifService.addNotification(newNotif)
        .subscribe(() => {
          this.resetNotification();
          this.notifService.setServiceStatus(true);
          console.log("New notification has been added successfully!");
        });
      });
    };
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
}