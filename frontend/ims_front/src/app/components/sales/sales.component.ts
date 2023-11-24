import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Product } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';
import { StocksService } from 'src/app/services/stocks/stocks';

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

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faRectangleList = faRectangleList;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;

  bills: SaleBill[] = [];
  items: SaleItem[] = [];
  products: Product[] = [];
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
    status: true,
  };

  item: SaleItem = {
    id: undefined,
    billno: null,
    product_id: undefined,
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
    ) {}

  toggleBillActionModal() {
    this.showBillActionModal = !this.showBillActionModal;
  }

  toggleItemActionModal() {
    this.showItemActionModal = !this.showItemActionModal;
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showItemActionModal) {
        this.toggleItemActionModal();
      } else if (this.showBillActionModal) {
        this.toggleBillActionModal();
      }
    }
  }

  viewOrder(bill: SaleBill) {
    this.bill = bill;
    this.loadItems();

    this.showOrder = !this.showOrder;
    if (!this.showOrder) {
      this.loadItems();
    }
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadBills();
    this.loadItems();
    this.loadProducts();
    this.loadStocks();
  }  

  loadBills() {
    this.salesService
      .getSaleBills()
      .subscribe(bills => {
        this.bills = bills.filter(bill => bill.status);
      });
  }

  loadItems() {
    this.salesService
      .getSaleItems()
      .subscribe((items) => {
        this.items = items;

      });
  }

  loadProducts() {
    this.productService
      .getProducts()
      .subscribe(products => {
        const activeProducts = products.filter(product => product.status === true);
        this.products = activeProducts;
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
  
  // DELETE BILL
  deleteSaleBill(saleBill: SaleBill) {
    if (this.bills.length <= 1) {
      window.alert("Please add new transaction before deleting this one! Consider editing this instead of deletion.");
      return;
    }
    else {
      this.deletingSaleBill = saleBill;
      this.toggleBillActionModal();
    }
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
        window.alert("Transaction has been deleted successfully!");
      });
  }

  // SHOW ITEMS
  getSaleBill(saleBillId: any): string {
    const foundSaleBill = this.bills.find(saleBill => saleBill.id === saleBillId);
    return foundSaleBill ? foundSaleBill.customer_name : 'Bill Not Found';
  }
  
  getProductDetails(productId: any): {productName: string, productCode: string, productPrice: number} {
    const foundProduct = this.products.find(product => product.id === productId);
    if (foundProduct) {
      return {
        productName: foundProduct.product_name,
        productCode: foundProduct.code,
        productPrice: foundProduct.price,
      }
    } else {
      return {
        productName: "Product not found!",
        productCode: "Product not found!",
        productPrice: 0,
      }
    }
  }
}