import { Component, OnInit, Renderer2, HostListener, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Menu } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { Product } from 'src/app/interface/Product';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes, faPrint, faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { OwnerService } from 'src/app/services/owner/owner.service';
import { Owner } from 'src/app/interface/Owner';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { Notification } from 'src/app/interface/Notification';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit, AfterContentChecked {
  deletingSaleBill?: SaleBill | null = null;
  deletingSaleItem?: SaleItem | null = null;

  isFetching: boolean = false;
  isLoading: boolean = false;

  proceedEditBill: boolean = false;
  proceedEditItem: boolean = false;
  proceedPayment: boolean = false;

  showBillForm: boolean = false;
  showBillTable: boolean = true;  
  updatingOrder: boolean = false;

  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;
  showInvoice: boolean = false;
  showPermissionModal: boolean = false;
  showGoToMenuModal: boolean = false;

  modalInputValue?: string;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faRectangleList = faRectangleList;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;
  faPrint = faPrint;
  faPhone = faPhone;
  faLocationDot = faLocationDot;
  faEnvelope = faEnvelope;

  notifications: Notification[] = [];
  activeBills: SaleBill[] = [];
  allBills: SaleBill[] = [];
  saleItems: SaleItem[] = [];
  allItems: SaleItem[] = [];
  menus: Menu[] = [];
  stocks: Stock[] = [];
  stocksToCheck: Stock[] = [];
  products: Product[] = [];
  amountChange: number = 0;

  saleBill: SaleBill = {
    id: undefined,
    billno: "",
    time: "",
    customer_name: "",
    remarks: "",
    amount_tendered: 0,
    grand_total: 0,
    mode_of_payment: "Cash",
    status: false,
  };

  originalBill: SaleBill = {
    id: undefined,
    billno: "",
    time: "",
    customer_name: "",
    remarks: "",
    amount_tendered: 0,
    grand_total: 0,
    mode_of_payment: "Cash",
    status: false,
  };

  saleItem: SaleItem = {
    id: undefined,
    billno: undefined,
    menu: undefined,
    quantity: 1,
    price: 0,
    sale_date: "",
    sub_total: 0,
    status: true,
  }

  notification: Notification = {
    id: undefined,
    content: "",
    timestamp: "",
    is_read: false,
    warning_type: ""
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

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
      private ownerService: OwnerService,
      private notifService: NotificationsService,
      private toastrService: ToastrService,
      private cdr: ChangeDetectorRef,
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

  resetBillForm() {
    this.proceedEditBill = false;
    this.saleBill = {
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
  
  resetItemForm() {
    this.proceedEditItem = false;
    this.saleItem.billno = undefined;
    this.saleItem.menu = undefined;
    this.saleItem.quantity = 1;
    this.saleItem.sale_date = "";
    this.saleItem.sub_total = 0;
  }

  toggleProceedPayment() {
    this.proceedPayment = !this.proceedPayment;
    if (!this.proceedPayment) {
      this.saleBill.amount_tendered = 0;
    }
  } 

  async toggleInvoice() {
    this.showInvoice = !this.showInvoice;
    if (!this.showInvoice) {
      this.toastrService.success('Transaction has been completed successfully!');
      this.loadBills();
      this.viewOrder(this.saleBill);
    }
  }

  togglePermissionModal() {
    this.showPermissionModal = !this.showPermissionModal;
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === "addNewProduct") {
      this.showGoToMenuModal = !this.showGoToMenuModal;
    }
  }

  toggleGoToMenuModal() {
    this.showGoToMenuModal = !this.showGoToMenuModal;
    if (!this.showGoToMenuModal) {
      this.saleItem.menu = undefined;
    }
  }

  toggleBillActionModal() {
    this.showBillActionModal = !this.showBillActionModal;
  }

  toggleItemActionModal() {
    this.showItemActionModal = !this.showItemActionModal;
  }

  toggleBillTable() {
    this.showBillTable = !this.showBillTable;
  }

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
    if (!this.showBillForm) {
      this.resetBillForm();
    }
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showInvoice) {
        this.toggleInvoice(); 
      } else if (this.showItemActionModal) {
        this.toggleItemActionModal();
      } else if (this.showBillActionModal) {
        this.toggleBillActionModal();
      } else if (this.showBillForm) {
        this.toggleBillForm();
      } else if (this.proceedPayment) {
        this.toggleProceedPayment();
      }
    }
  }

  viewOrder(saleBill: SaleBill) {
    this.saleBill = saleBill;
    this.loadItems();
    this.toggleBillTable();

    this.updatingOrder = !this.updatingOrder;
    if (!this.updatingOrder) {
      this.resetBillForm();
      this.loadItems();
    }
  }

  calculateGrandtotal(saleItems: SaleItem[]): number {
    let grandTotal = 0;
    saleItems.forEach(item => {
      grandTotal += item.sub_total || 0;
    });

    return grandTotal;
  }

  increaseQtyInput(): void {
    this.saleItem.quantity ++;
  }

  decreaseQtyInput(): void {
    if (this.saleItem.quantity < 1) {
      return;
    }
    this.saleItem.quantity --;
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadNotifications();
    this.loadMenus();
    this.loadStocks();
    this.loadProducts();
    this.loadOwner();
    this.loadItems();
    this.loadBills();
  }
  
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }

  loadNotifications() {
    this.notifService.getNotifications().subscribe({
      next: notifs => this.notifications = notifs,
      error: err => console.log("Failed to fetch notifications", err),
    })
  }

  loadBills() {
    this.isFetching = true;
    this.salesService
    .getSaleBills()
    .subscribe({
      next: (salesBills) => {
        this.isFetching = false;
        this.activeBills = salesBills.filter(item => !item.status);
        this.allBills = salesBills;
      },
      error: (err) => {
        this.isFetching = false;
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  loadItems() {
    this.isFetching = true;
    this.salesService
    .getSaleItems()
    .subscribe({
      next: (saleItems) => {
        this.isFetching = false;
        this.allItems = saleItems.filter(item => item.status);

        if (this.updatingOrder) {
          this.saleItems = saleItems.filter(item => item.billno === this.saleBill.id && item.status);
        } else {
          this.saleItems = saleItems.filter(item => item.billno === null && item.status);
          this.saleBill.grand_total = this.calculateGrandtotal(this.saleItems);
        }
      },
      error: (err) => {
        this.isFetching = false;
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  loadMenus() {
    this.productService
    .getMenus()
    .subscribe({
      next: menus => {
        const activeMenus = menus.filter(menu => menu.status === true);
        this.menus = activeMenus;
      },
      error: err => console.log(err)
    })
  }

  loadStocks() {
    this.stockService
    .getStocks()
    .subscribe({
      next: stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
        this.stocksToCheck = stocks.filter(stock => stock.show_notification);
      },
      error: err => console.log(err)
    })
  }

  loadProducts() {
    this.productService
    .getProducts()
    .subscribe({
      next: products => {
        this.products = products;
      },
      error: err => console.log(err)
    })
  }

  loadOwner() {
    this.ownerService
    .getOwners()
    .subscribe({
      next: owners => {
        this.owner = owners[0];
      },
      error: err => console.log(err)
    })
  }

  getItemLength(bill: SaleBill) {
    const items = this.allItems.filter(item => item.billno === bill.id);
    return items.length;
  }

  onAdminPermission() {
    if (this.proceedEditBill) {
      this.proceedUpdateBill();
    } else if (this.deletingSaleItem !== null) {
      this.proceedDeleteItem();
    }
  }

  onSubmitBill() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addBill();
    }
  }

  async onAmountTenderedChange() {
    if (this.saleBill.amount_tendered < 0) {
      this.toastrService.error("Enter valid amount!");
      return;
    }

    if (this.saleBill.grand_total) {
      await this.uiService.wait(300);
      if (this.saleBill.amount_tendered < this.saleBill.grand_total) {
        this.amountChange = 0;
      } else {
        this.amountChange = this.saleBill.amount_tendered - this.saleBill.grand_total
        this.saleBill.status = true;
      }
    }
  }

  /* ADD BILLS AND ITEMS */
  // Add Bills
  addBill() {
    if (!this.saleBill.customer_name) {
      this.toastrService.error("Enter customer");
      return;
    }
    
    const newBill = {
      ...this.saleBill,
      customer_name: this.saleBill.customer_name.toUpperCase(),
      remarks: this.saleBill.remarks.toUpperCase(),
    }

    this.isLoading = true;
    this.salesService.addSaleBill(newBill)
      .subscribe({
        next: async (bill) => {
          this.isLoading = false;
          this.activeBills.push(bill);
          
          this.saleItems.map(item => {
            if (!item.billno) {
              item.billno = bill.id;
              this.salesService.editSaleItem(item).subscribe(item => {
                const index = this.saleItems.findIndex(i => i.id === item.id);
                this.saleItems[index] = item;
                this.loadItems();
              })
            }
          })

          this.resetBillForm();
          if (!bill.grand_total || bill.grand_total < 1) {
            this.toastrService.warning(
              "You have saved a transaction without a total bill amount. Make sure it is correct.",
              "Zero Total Amount!",
              {timeOut: 5000},
            );
          }
          this.toastrService.success("New transaction has been added successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  // Add Items
  addItem() {
    if (!this.saleItem.menu) {
      this.toastrService.error("Select a product!");
      return;
    } else if (!this.saleItem.quantity || this.saleItem.quantity <= 0) {
      this.toastrService.error("Enter quantity!");
      return;
    }
    
    this.saleItem.billno = this.saleBill.id;
    this.saleItem.price = this.getMenuDetails(Number(this.saleItem.menu)).price;
    this.saleItem.sub_total = this.saleItem.quantity * this.saleItem.price;

    const newSaleItem = {
      ...this.saleItem,
    }
    
    this.salesService.addSaleItem(newSaleItem)
    .subscribe({
      next: async (saleItem) => {
        this.saleItems.push(saleItem);
        this.loadItems();

        if (this.updatingOrder) {
          this.saleBill.grand_total += saleItem.sub_total;
          this.salesService.editSaleBill(this.saleBill)
          .subscribe({
            next: () => {
              this.loadBills();
              this.addNotification();
            },
            error: err => console.log(err) 
          });
        }

        this.resetItemForm();
      },
      error: (err) => {
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  // UPDATE SALE BILL
  updateSaleBill(saleBill: SaleBill) {
    this.proceedEditBill = true;

    saleBill.customer_name.toUpperCase();
    saleBill.remarks.toUpperCase();

    this.saleBill = { ...saleBill };
    this.originalBill = { ...saleBill };

    this.toggleBillForm();
  }

  onSaveUpdate() {
    if (JSON.stringify(this.originalBill) === JSON.stringify(this.saleBill)) {
      this.toggleBillForm();
      return;
    }

    const is_staff = sessionStorage.getItem("is_staff");
    if (is_staff === "false") {
      this.toastrService.warning("Request permission to proceed with these action.")
      this.togglePermissionModal();
    } else {
      this.modalInputValue = undefined;
      this.proceedUpdateBill();
    }
  }

  proceedUpdateBill() {
    if (!this.saleBill.customer_name) {
      this.toastrService.success("Enter customer");
      return;
    }

    const editingSaleBill = {
      ...this.saleBill,
      customer_name: this.saleBill.customer_name.toUpperCase(),
      remarks: this.saleBill.remarks.toUpperCase(),
    }

    this.isLoading = true;
    this.salesService
    .editSaleBill(editingSaleBill, this.modalInputValue)
    .subscribe({
      next: async (saleBillData) => {
        this.isLoading = false;
        const index = this.activeBills.findIndex(saleBill => saleBill.id === saleBillData.id);
        this.activeBills[index] = saleBillData;
        this.modalInputValue = undefined;
        this.showPermissionModal = false;
        this.showBillForm = false;

        this.toastrService.success("Successfully saved changes to the customer details.");
      },
      error: (err) => {
        this.isLoading = false;
        this.uiService.displayErrorMessage(err);
      }
    });
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
          this.isLoading =false;
          this.activeBills = this.activeBills.filter(s => s.id !== this.deletingSaleBill?.id);
          this.deletingSaleBill = null;
          this.showBillActionModal = false;
          this.toastrService.success("Transaction has been deleted successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.showBillActionModal = false;
          this.uiService.displayErrorMessage(err);
        }
      });
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
        name: "Product not found!",
        code: "Product not found!",
        price: 0,
      }
    }
  }

  onSubmitItem() {
    if (this.proceedEditItem) {
      this.saveItemUpdate();
    } else {
      this.addItem();
    }
  }

  proceedToMenu() {
    this.router.navigate(['products/']);
  }

  // UPDATE SALE ITEM
  updateSaleItem(saleItem: SaleItem) {
    this.proceedEditItem = true;
    this.saleItem = {...saleItem};
  }

  saveItemUpdate() {
    this.saleItem.sub_total = this.saleItem.quantity * this.getMenuDetails(this.saleItem.menu).price;

    const editingSaleItem = {
      ...this.saleItem
    }

    this.isLoading = true;
    this.salesService
      .editSaleItem(editingSaleItem)
      .subscribe({
        next: async (saleItemData) => {
          this.isLoading = false;
          const index = this.saleItems.findIndex(saleItem => saleItem.id === saleItemData.id);
  
          this.toastrService.success("Successfully saved changes to the item.");
  
          this.saleItems[index] = saleItemData;
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  // DELETE SALE ITEM
  deleteSaleItem(saleItem: SaleItem) {
    this.deletingSaleItem = saleItem;
    if (!this.updatingOrder) {
      this.onConfirmDeleteItem();
    } else {
      this.toggleItemActionModal();
    }
  }

  onConfirmDeleteItem() {
    const is_staff = sessionStorage.getItem("is_staff");
    if (is_staff === "false") {
      this.toastrService.warning("Request permission to proceed with these action.")
      this.togglePermissionModal();
    } else {
      this.modalInputValue = undefined;
      this.proceedDeleteItem();
    }
  }

  proceedDeleteItem() {
    if (!this.deletingSaleItem) {
      return;
    }

    // Reduce total bill upon deleting an item
    this.saleBill.grand_total -= this.deletingSaleItem.sub_total;

    if (this.updatingOrder) {
      this.salesService.editSaleBill(this.saleBill)
      .subscribe({
        next: () => {this.addNotification()},
        error: (err) => {console.log(err)},
      });
    }

    this.salesService
    .deleteSaleItem(this.deletingSaleItem, this.modalInputValue)
    .subscribe({
      next: async () => {
        this.activeBills = this.activeBills.filter(bill => bill.id !== this.deletingSaleItem?.id);
        this.deletingSaleItem = null;
        this.modalInputValue = undefined;
        this.showPermissionModal = false;
        this.showItemActionModal = false;
        this.loadItems();
        this.toastrService.success("Item has been deleted successfully!");
      },
      error: (err) => {
        this.showBillActionModal = false;
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  onBillOut() {
    this.toggleInvoice();
    if (this.showInvoice) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
    }

    this.isLoading = true;
    this.salesService.editSaleBill(this.saleBill)
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          const index = this.activeBills.findIndex(saleBill => saleBill.id === data.id);
          this.activeBills[index] = data;
          this.loadBills();
          this.addNotification();
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  onPayment() {
    if (this.saleBill.grand_total) {
      if (this.saleBill.amount_tendered < this.saleBill.grand_total) {
        this.toastrService.error("Invalid amount tendered!");
        return;
      }
    }

    const saleItems = Array.from(this.saleItems);
    const products = Array.from(this.products);
    const stocks = Array.from(this.stocks);

    const accumulatedItems = saleItems.reduce((acc: SaleItem[], obj: SaleItem) => {
      const existingObj = acc.find(item => item.menu === obj.menu);
      if (existingObj) {
        existingObj.quantity += obj.quantity;
      } else {
        acc.push({ ...obj })
      }
      return acc;
    }, []);

    const menuIDs = accumulatedItems.map(item => item.menu);
    const filteredProducts = products.filter(product => menuIDs.includes(product.menu));

    filteredProducts.forEach(item => {
      const foundProduct = accumulatedItems.find(product => product.menu === item.menu);
      if (foundProduct) {
        item.qty_per_order = foundProduct.quantity * item.qty_per_order;
      }
      return item;
    });

    const accumulatedProducts = filteredProducts.reduce((prodAccu: Product[], prodObj: Product) => {
      const existingObj = prodAccu.find(item => item.stock_id === prodObj.stock_id);
      if (existingObj) {
        existingObj.qty_per_order += prodObj.qty_per_order;
      } else {
        prodAccu.push({...prodObj});
      }
      return prodAccu;
    }, [])

    stocks.forEach(stock => {
      const foundStock = accumulatedProducts.find(product => product.stock_id === stock.id);
      if (foundStock) {
        stock.quantity -= foundStock.qty_per_order;
      }
    })

    this.isLoading = true;
    this.salesService.editSaleBill(this.saleBill)
      .subscribe({
        next: (bill) => {
          this.isLoading = false;
          if (bill.grand_total) {
            stocks.map(stock => {
              this.stockService.editStock(stock).subscribe();
            });
            this.loadBills();
            this.toggleInvoice();
            this.toggleProceedPayment();
            this.addNotification();
          } else {
            this.toastrService.error("No payable amount!");
            return;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  printReceipt(): void {
    window.print();
  }

  addNotification() {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const critStocks = this.stocksToCheck.filter(stock => stock.quantity <= 60);
    const lowStocks = this.stocksToCheck.filter(stock => stock.quantity <= 120 && stock.quantity > 60);
  
    const createAndAddNotification = (content: string, warningType:string) => {
      const notifExists = this.notifications.some(notif => {
        const newNotifDate = new Date(notif.timestamp);
        const newNotifDay = newNotifDate.getDay();
        return notif.content === content && notif.warning_type === warningType && newNotifDay === currentDay;
      });
  
      if (!notifExists) {
        const newNotif = {
          id: this.notification.id,
          timestamp: this.notification.timestamp,
          is_read: this.notification.is_read,
          content: content,
          warning_type: warningType
        };
  
        this.notifService.addNotification(newNotif)
          .subscribe({
            next: (notif) => {
              this.notifService.setServiceStatus(true);
              this.resetNotification();
              this.loadNotifications();
              console.log("New notification has been added successfully!", notif);
            },
            error: (err) => {
              console.log("Failed to add new notification", err);
            },
          });
      }
    };
  
    critStocks.forEach(stock => {
      const content = `${stock.quantity} ${stock.unit}/s of ${stock.stock_name} remaining.`;
      const warningType = "Critical stock level";
      createAndAddNotification(content, warningType);
    });
  
    lowStocks.forEach(stock => {
      const content = `${stock.quantity} ${stock.unit}/s of ${stock.stock_name} remaining.`;
      const warningType = "Low stock level";
      createAndAddNotification(content, warningType);
    });
  }
  
  onValueChanged(value: string): void {
    this.modalInputValue = value;
  }

  /* This class end here.*/
}