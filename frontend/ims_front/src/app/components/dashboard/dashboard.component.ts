import { Component, OnInit } from '@angular/core';
import { UserDetails } from 'src/app/interface/UserDetails';
import { UiService } from 'src/app/services/ui/ui.service';
import { StocksService } from 'src/app/services/stocks/stocks';
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardItems: [] = [];
  stocks: Stock[] = [];
  products: Menu[] = [];
  saleBills: SaleBill[] = [];
  saleItems: SaleItem[] = [];
  todaySaleBills: SaleBill[] = [];
  purchaseBills: PurchaseBill[] = [];
  purchaseItems: PurchaseItem[] = [];
  suppliers: Supplier[] = [];

  today: Date = new Date;

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
    this.stockServices.getStocks()
    .subscribe(stocks => {
      this.stocks = stocks;
    });

    this.productService.getMenus()
    .subscribe(products => {
      this.products = products;
    })

    this.purchaseService.getPurchaseBills()
    .subscribe(purchaseBills => {
      this.purchaseBills = purchaseBills;
    })

    this.purchaseService.getPurchaseItems()
    .subscribe(purchaseItems => {
      this.purchaseItems = purchaseItems;
    })

    this.saleService.getSaleBills()
    .subscribe(saleBills => {
      this.saleBills = saleBills;
      this.todaySaleBills = saleBills.filter(bill => {
        const dateToday = this.datePipe.transform(this.today, 'MM-dd-yyyy');
        const billToday = this.datePipe.transform(bill.time, 'MM-dd-yyyy');
        console.log(billToday);
        return billToday === dateToday ;
      })
      console.log(this.todaySaleBills);
    })

    this.saleService.getSaleItems()
    .subscribe(saleItems => {
      this.saleItems = saleItems;
    })

    this.supplierService.getSuppliers()
    .subscribe(suppliers => {
      this.suppliers = suppliers;
    })

    const dashboardItems: any = [
      { title: "stocks", length: this.stocks.length },
      { title: "menu", length: this.products.length },
      { title: "purchaseBills", length: this.purchaseBills },
      { title: "purchaseItems", length: this.purchaseItems },
      { title: "saleBills", length: this.saleBills },
      { title: "saleItems", length: this.saleItems },
      { title: "suppliers", length: this.suppliers },
    ]

    this.dashboardItems = dashboardItems;
  }
}
