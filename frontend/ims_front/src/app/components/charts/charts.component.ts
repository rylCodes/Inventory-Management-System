import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { SaleBill } from 'src/app/interface/Sale';
import { SalesService } from 'src/app/services/sales/sales.service';
import { PurchaseBill } from 'src/app/interface/Purchase';
import { PurchasesService } from 'src/app/services/purchases/purchases.service';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();

  @Input() sales: SaleBill[] = [];
  accumulatedSales: SaleBill[] = [];
  barChart?: Chart;
  
  @Input() purchases: PurchaseBill[] = [];
  accumulatedPurchases: PurchaseBill[] = [];

  @Input() stocks: Stock[] = [];
  pieChart?: Chart;

  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();

  constructor(
    private saleService: SalesService,
    private purchasesService: PurchasesService,
    private stockService: StocksService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadPurchases();
    this.loadStocks();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadSales(): void {
    const currentMonthSales = this.sales.filter(sale => new Date(sale.time).getMonth() === this.currentMonth);
    this.accumulatedSales = this.calculateAccumulatedSales(currentMonthSales);

    if (this.accumulatedSales.length > 0 || this.accumulatedPurchases.length > 0) {
      this.initializeBarChart();
    } else {
      this.barChart = undefined;
    };
  }

  loadPurchases(): void {
    const currentMonthPurchases = this.purchases.filter(purchase => {
      // Check if purchase.time is defined before attempting to create a Date object
      return purchase.time && new Date(purchase.time).getMonth() === this.currentMonth;
    });
    this.accumulatedPurchases = this.calculateAccumulatedPurchases(currentMonthPurchases);

      if (this.accumulatedSales.length > 0 || this.accumulatedPurchases.length > 0) {
        this.initializeBarChart();
      } else {
        this.barChart = undefined;
      };
  }

  loadStocks() {        
    if (this.stocks.length > 0) {
      this.initializePieChart();
    } else {
      this.pieChart = undefined;
    };
  }

  calculateAccumulatedPurchases(purchases: PurchaseBill[]): PurchaseBill[] {
    return purchases.reduce((accPurchases: PurchaseBill[], objPurchase: PurchaseBill) => {
      const existingObjPurchase = accPurchases.find(purchase => {
        const purchaseDate = this.datePipe.transform(purchase.time, "dd");
        const objPurchaseDate = this.datePipe.transform(objPurchase.time, "dd");
        return purchaseDate === objPurchaseDate;
      });
  
      if (existingObjPurchase) {
        existingObjPurchase.grand_total += objPurchase.grand_total;
      } else {
        accPurchases.push({ ...objPurchase });
      }
  
      return accPurchases;
    }, []);
  }

  calculateAccumulatedSales(sales: SaleBill[]): SaleBill[] {
    return sales.reduce((accSales: SaleBill[], objSale: SaleBill) => {
      const existingObjSale = accSales.find(sale => {
        const saleDate = this.datePipe.transform(sale.time, "dd");
        const objSaleDate = this.datePipe.transform(objSale.time, "dd");
        return saleDate === objSaleDate;
      });
  
      if (existingObjSale) {
        existingObjSale.grand_total += objSale.grand_total;
      } else {
        accSales.push({ ...objSale });
      }
  
      return accSales;
    }, []);
  }

  initializeBarChart(): void {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentDate.getFullYear(), currentMonth + 1, 0).getDate();

    const categories = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const formattedDay = ("0" + day).slice(-2);
      return formattedDay;
    });

    const salesData = categories.map(day => {
      const saleForDay = this.accumulatedSales.find(sale => this.datePipe.transform(sale.time, 'dd') === day);
      return saleForDay ? saleForDay.grand_total : 0;
    });

    const purchasesData = categories.map(day => {
      const purchaseForDay = this.accumulatedPurchases.find(purchase => this.datePipe.transform(purchase.time, 'dd') === day);
      return purchaseForDay ? purchaseForDay.grand_total : 0;
    });

    this.barChart = new Chart({
      chart: {
        type: "column"
      },
      title: {
        text: "Sales and Purchases"
      },
      xAxis: {
        title: {
          text: `${this.datePipe.transform(currentDate, 'MMMM')}`
        },
        categories: categories,
        labels: {
          formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
            return this.value.toString();
          }
        }
      },
      yAxis: {
        title: {
          text: "Amount"
        }
      },
      tooltip: {
        shared: true,
        formatter: function () {
          let tooltipText = '<b>Date:</b> ' + (this.x ? this.x : 'N/A') + '<br>';
          
          if (this.points && this.points.length >= 2) {
            const salesPoint = this.points[0];
            const purchasesPoint = this.points[1];
            
            if (salesPoint && salesPoint.y !== undefined) {
              tooltipText += '<b>Sales:</b> ' + salesPoint.y + '<br>';
            }
  
            if (purchasesPoint && purchasesPoint.y !== undefined) {
              tooltipText += '<b>Purchases:</b> ' + purchasesPoint.y + '<br>';
            }
          }
          
          return tooltipText;
        }
      },
      legend: {
        enabled: true
      },
      series: [{
        type: 'column',
        name: 'Sales',
        data: salesData
      }, {
        type: 'column',
        name: 'Purchases',
        data: purchasesData
      }],

      accessibility: {
        enabled: false,
      }
    });
  }

  initializePieChart(): void {
    const stockData = this.stocks.map(stock => ({
      name: stock.stock_name,
      y: stock.quantity,
      unit: `${stock.quantity > 0? stock.unit + 's' : stock.unit}`
    }));

    this.pieChart = new Chart({
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Stock Distribution'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          }
        }
      },
      legend: {
        enabled: true,
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'middle',
        labelFormatter: function(this: any) {
          return `${this.name}: ${this.y}`;
        }
      },
      series: [{
        type: 'pie',
        name: 'Stocks',
        data: stockData
      }],
      accessibility: {
        enabled: false,
      }
    });
  }

  /* MOCK ARRAYS FOR CHARTS */
  // Mock Sales
  mockSales(): SaleBill[] {
    const saleBills: SaleBill[] = [
      {
          time: `2023-${this.currentMonth + 1}-10T12:30:00`,
          customer_name: 'Alice Johnson',
          remarks: 'Regular customer',
          amount_tendered: 150.50,
          grand_total: 200.00,
          mode_of_payment: 'Credit Card',
          status: true,
      },
      {
          time: `2023-${this.currentMonth + 1}-15T15:45:00`,
          customer_name: 'Bob Smith',
          remarks: 'New customer',
          amount_tendered: 80.00,
          grand_total: 80.00,
          mode_of_payment: 'Cash',
          status: true,
      },
      {
          time: `2023-${this.currentMonth + 1}-20T10:00:00`,
          customer_name: 'Eve Rodriguez',
          remarks: 'VIP customer',
          amount_tendered: 300.00,
          grand_total: 350.00,
          mode_of_payment: 'Debit Card',
          status: false,
      },
    ];

    return saleBills;
  }

  // Mock Purchases
  mockPurchase(): PurchaseBill[] {
    const purchaseBills: PurchaseBill[] = [
      {
          billno: 'PB2023001',
          time: `2023-${this.currentMonth + 1}-05T14:15:00`,
          supplier_id: 101,
          grand_total: 1200.50,
          remarks: 'Received raw materials for production',
      },
      {
          billno: 'PB2023002',
          time: `2023-${this.currentMonth + 1}-10T09:30:00`,
          supplier_id: 102,
          grand_total: 800.00,
          remarks: 'Restocking office supplies',
      },
      {
          billno: 'PB2023003',
          time: `2023-${this.currentMonth + 1}-15T11:45:00`,
          supplier_id: 103,
          grand_total: 2500.00,
          remarks: 'New machinery for production line',
      },
    ];

    return purchaseBills;
  }

  // Mock Stocks
  mockStocks(): Stock[] {
    const stocks: Stock[] = [
      {
          code: 'STK001',
          stock_name: 'Widget A',
          description: 'High-quality widgets for various uses',
          quantity: 100,
          unit: 'pieces',
          date_added: `2023-${this.currentMonth + 1}-01T08:00:00`,
          status: true,
          show_notification: false,
      },
      {
          code: 'STK002',
          stock_name: 'Gadget B',
          description: 'Advanced gadgets with multiple features',
          quantity: 50,
          unit: 'units',
          date_added: `2023-${this.currentMonth + 1}-05T12:30:00`,
          status: true,
          show_notification: true,
      },
      {
          code: 'STK003',
          stock_name: 'Accessory C',
          description: 'Essential accessories for electronic devices',
          quantity: 200,
          unit: 'pieces',
          date_added: `2023-${this.currentMonth + 1}-10T10:15:00`,
          status: true,
          show_notification: false,
      },
    ];

    return stocks;
  }

  // This class ends here
}
