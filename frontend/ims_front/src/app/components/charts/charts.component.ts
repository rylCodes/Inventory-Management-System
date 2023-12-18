import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { SaleBill } from 'src/app/interface/Sale';
import { SalesService } from 'src/app/services/sales/sales.service';
import { PurchaseBill } from 'src/app/interface/Purchase';
import { PurchasesService } from 'src/app/services/purchases/purchases.service';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<void> = new Subject<void>();

  sales: SaleBill[] = [];
  accumulatedSales: SaleBill[] = [];
  barChart?: Chart;
  
  purchases: PurchaseBill[] = [];
  accumulatedPurchases: PurchaseBill[] = [];

  stocks: Stock[] = [];
  pieChart?: Chart;

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
    this.saleService.getSaleBills().subscribe({
      next: sales => {
        this.sales = sales.filter(sale => sale.status);

        this.accumulatedSales = sales.reduce((accSales: SaleBill[], objSale: SaleBill) => {
          const existingObjSale = accSales.find(sale => {
            const saleDate = this.datePipe.transform(sale.time, "dd");
            const objSaleDate = this.datePipe.transform(objSale.time, "dd");
            return saleDate === objSaleDate;
          })

          if (existingObjSale) {
            existingObjSale.grand_total += objSale.grand_total;
          } else {
            accSales.push({ ...objSale });
          }

          return accSales;
        }, []);
      },
      error: err => console.log("Failed to display sales", err),
    });
  }

  loadPurchases(): void {
    this.purchasesService.getPurchaseBills().subscribe({
      next: purchases => {
        this.purchases = purchases;
        
        this.accumulatedPurchases = this.calculateAccumulatedPurchases(purchases);
      },
      error: err => console.log("Failed to fetch purchases", err),
    });
  }

  loadStocks() {
    this.stockService.getStocks().subscribe({
      next: (stocks) => {
        this.stocks = stocks;

        if (this.sales.length > 0 && this.purchases.length > 0) {
          this.initializeBarChart();
        };

        if (this.stocks.length > 0) {
          this.initializePieChart();
        };
      },
      error: (err) => console.log("Failed to fetch stocks!", err),
    })
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

}
