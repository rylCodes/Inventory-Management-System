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

  constructor(private stockService: StocksService) {}

  ngOnInit(): void {
    this.stockService
      .getStocks()
      .subscribe((stocks) => {this.stocks = stocks});
  }
}
