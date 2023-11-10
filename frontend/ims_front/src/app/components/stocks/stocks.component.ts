import { Component, OnInit } from '@angular/core';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks.service';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css'],
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  code: string = "";
  name: string = "";
  description: string = "";
  quantity: number = 0;
  unit: string = "bottle";
  status: boolean = true;
  customUnit: string = "";


  constructor(private stockService: StocksService) {}

  onAddStock() {
    if (!this.name) {
      window.alert("Enter stock name!");
      return;
    }

    if (this.quantity < 0) {
      window.alert("Invalid stock quantity!");
      return;
    }

    const newStock = {
      code: this.code,
      name: this.name,
      description: this.description,
      quantity: this.quantity,
      unit: this.unit || this.customUnit,
      status: this.status,
    }

    this.stockService.addStock(newStock)
      .subscribe(stock => this.stocks.push(stock));
     
    this.code = "";
    this.name = "";
    this.description = "";
    this.quantity = 0;
    this.unit = "";
    this.status = true;
  }

  ngOnInit(): void {
    this.stockService
      .getStocks()
      .subscribe((stocks) => {this.stocks = stocks});
  }

}
