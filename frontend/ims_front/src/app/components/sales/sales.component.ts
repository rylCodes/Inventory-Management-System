import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Menu } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes, faPrint, faLocationDot, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { Owner } from 'src/app/interface/Owner';
import { OwnerService } from 'src/app/services/owner/owner.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  deletingSaleBill?: SaleBill | null = null;
  deletingSaleItem?: SaleItem | null = null;

  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;
  showOrder: boolean = false;
  showInvoice: boolean = false;

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

  bills: SaleBill[] = [];
  allItems: SaleItem[] = [];
  eachBillItems: SaleItem[] = [];
  menus: Menu[] = [];
  stocks: Stock[] = [];
  owners: Owner[] = [];
  amountChange: number = 0;
  eachBill: [] = [];

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
  }

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
      private ownerService: OwnerService,
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

  toggleInvoice(bill: SaleBill) {
    this.bill = bill;
    this.loadBills();
    this.loadEachBillItems();

    this.showInvoice = !this.showInvoice;
    if (this.showInvoice) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
      this.resetBill;
    }
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showItemActionModal) {
        this.toggleItemActionModal();
      } else if (this.showBillActionModal) {
        this.toggleBillActionModal();
      } else if (this.showInvoice) {
        this.toggleInvoice(this.bill); 
      }
    }
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadBills();
    this.loadAllItems();
    this.loadMenus();
    this.loadStocks();
    this.loadOwners();
  }  

  loadBills() {
    this.salesService
      .getSaleBills()
      .subscribe({
        next: bills => {
          this.bills = bills.filter(bill => bill.status)
        },
        error: (error) => {
          this.uiService.displayErrorMessage(error);
        }
      });
  }

  loadEachBillItems() {
    this.salesService
      .getSaleItems()
      .subscribe({
        next: (items) => {
          this.eachBillItems = items.filter(item => item.billno === this.bill.id);
        },
        error: (error) => {
          this.uiService.displayErrorMessage(error);
        }
      });
  }

  loadAllItems() {
    this.salesService
      .getSaleItems()
      .subscribe({
        next: (items) => {
          this.allItems = items;
        },
        error: (error) => {
          this.uiService.displayErrorMessage(error);
        }
      });
  }

  loadMenus() {
    this.productService
      .getMenus()
      .subscribe(menus => {
        const activeMenus = menus.filter(menu => menu.status === true);
        this.menus = activeMenus;
      })
  }

  loadStocks() {
    this.stockService
      .getStocks()
      .subscribe(stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
      })
  }

  loadOwners() {
    this.ownerService
      .getOwners()
      .subscribe({
        next: owners => {
          this.owners = owners;
        },
        error: (error) => {
          this.uiService.displayErrorMessage(error);
        }
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

    this.salesService
      .deleteSaleBill(this.deletingSaleBill)
      .subscribe(async () => {
        this.bills = this.bills.filter(s => s.id !== this.deletingSaleBill?.id);
        this.deletingSaleBill = null;
        this.toggleBillActionModal()
        await this.uiService.wait(100);
        window.alert("Transaction history has been deleted successfully!");
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
}