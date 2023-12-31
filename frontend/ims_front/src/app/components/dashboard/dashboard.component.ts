import { Component, OnInit } from '@angular/core';
import { UserDetails } from 'src/app/interface/UserDetails';
import { UiService } from 'src/app/services/ui/ui.service';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { SalesService } from 'src/app/services/sales/sales.service';
import { PurchasesService } from 'src/app/services/purchases/purchases.service';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';
import { Product, Menu } from 'src/app/interface/Product'; 
import { Stock } from 'src/app/interface/Stock';
import { Supplier } from 'src/app/interface/Supplier';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { DatePipe } from '@angular/common';
import { faCircleArrowRight, faBoxesPacking, faRectangleList, faBoxesStacked, faMoneyBillTrendUp } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  dashboardItems: any = [];
  stocks: Stock[] = [];
  products: Menu[] = [];
  saleBills: SaleBill[] = [];
  saleItems: SaleItem[] = [];
  todaySaleBills?: SaleBill[];
  yesterdaySaleBills?: SaleBill[];
  thisWeekSaleBills?: SaleBill[];
  purchaseBills: PurchaseBill[] = [];
  purchaseItems: PurchaseItem[] = [];
  suppliers: Supplier[] = [];
  stockWithLowestQuantity?: Stock;

  faBoxesStacked = faBoxesStacked;
  faCircleArrowRight = faCircleArrowRight;
  faBoxesPacking = faBoxesPacking;
  faRectangleList = faRectangleList;
  faMoneyBillTrendUp = faMoneyBillTrendUp;

  isFetching: boolean = false;

  constructor(
    private uiService: UiService,
    private stockServices: StocksService,
    private productService: ProductsService,
    private supplierService: SuppliersService,
    private saleService: SalesService,
    private purchaseService: PurchasesService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.isFetching = true;

    const saleBills$: Observable<SaleBill[]> = this.saleService.getSaleBills();
    const suppliers$: Observable<Supplier[]> = this.supplierService.getSuppliers();
    const stocks$: Observable<Stock[]> = this.stockServices.getStocks();
    const products$: Observable<Menu[]> = this.productService.getMenus();
    const purchaseBills$: Observable<PurchaseBill[]> = this.purchaseService.getPurchaseBills();

    forkJoin({
      saleBills: saleBills$,
      suppliers: suppliers$,
      stocks: stocks$,
      products: products$,
      purchaseBills: purchaseBills$,
    }).subscribe({
      next: (data) => {
        this.saleBills = data.saleBills;
        this.suppliers = data.suppliers;
        this.stocks = data.stocks;
        this.products = data.products;
        this.purchaseBills = data.purchaseBills;
        
        this.stockWithLowestQuantity  = data.stocks.reduce((minStock, currentStock) => {
          return currentStock.quantity < minStock.quantity ? currentStock : minStock;
        }, data.stocks[0]);

        this.isFetching = false;
      },
      error: (err) => {
        this.isFetching = false;
        console.log(err);
      },
    })
  }

  getTodaySales(): number {
    let total = 0;
    this.todaySaleBills = this.saleBills.filter(bill => {
      const currentDate = new Date();
      const dateToday = this.datePipe.transform(currentDate, 'MM-dd-yyyy');
      const billDate = this.datePipe.transform(bill.time, 'MM-dd-yyyy');
      return billDate === dateToday && bill.status;
    })

    if (!this.todaySaleBills) {
      return 0;
    };

    this.todaySaleBills.forEach(bill => {
      if (bill && bill.grand_total) {
        total += bill.grand_total;
      }
    })
    return total;
  }

  getYesterdaySales(): number {
    let total = 0;
    this.yesterdaySaleBills = this.saleBills.filter(bill => {
      const currentDate = new Date();
      const yesterday = currentDate.setDate(currentDate.getDate() - 1);
      const dateYesterday = this.datePipe.transform(yesterday, 'MM-dd-yyyy');
      const billDate = this.datePipe.transform(bill.time, 'MM-dd-yyyy');
      return billDate === dateYesterday && bill.status;
    })

    if (!this.yesterdaySaleBills) {
      return 0;
    }
    this.yesterdaySaleBills.forEach(bill => {
      if (bill && bill.grand_total) {
        total += bill.grand_total;
      }
    })
    return total;
  }

  getThisWeekSales(): number {
    let total = 0;
    this.thisWeekSaleBills = this.saleBills.filter(bill => {
      const currentDate = new Date();
      const currentDay = currentDate.getDay();
      const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;

      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - daysToSubtract);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const saleDate = new Date(bill.time);
      return saleDate >= monday && saleDate <= sunday && bill.status;
    })

    if (!this.thisWeekSaleBills) {
      return 0;
    }

    this.thisWeekSaleBills.forEach(bill => {
      if (bill && bill.grand_total) {
        total += bill.grand_total;
      }
    })
    return total;
  }
}
