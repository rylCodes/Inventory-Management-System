import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription } from 'rxjs';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css'],
})
export class StocksComponent implements OnInit, OnDestroy {
  confirmDelete: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  stocks: Stock[] = [];

  code: string = "";
  name: string = "";
  description: string = "";
  quantity: number = 0;
  unit: string = "piece";
  status: boolean = true;
  customUnit: string = "";

  showAddStocks: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(private stockService: StocksService, private uiService: UiService) {
    this.formSubscription = this.uiService
      .onToggleForm()
      .subscribe((value: boolean) => {this.showAddStocks = value});
  }

  ngOnInit(): void {
    this.stockService
      .getStocks()
      .subscribe((stocks) => {
        const sortedStocks = stocks.sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
        this.stocks = sortedStocks;
      });
  }

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

    this.showAddStocks = false;

    window.alert("New stock has been created successfully!");
  }

  toggleAddStocks() {
    return this.uiService.toggleForm();
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
    if (this.actionModalSubscription) {
      this.actionModalSubscription.unsubscribe();
    }
  }

  onConfirmDelete() {
    this.confirmDelete = !this.confirmDelete;
  }

  deleteStock(stock: Stock) {
    this.toggleActionModal();
    if (this.confirmDelete) {
      this.stockService
        .deleteStock(stock)
        .subscribe(() => {
          this.stocks = this.stocks.filter(s => s.id !== stock.id);
          window.alert("Stock has been deleted successfully!");
          this.toggleActionModal();
          this.confirmDelete = false;
        });
    }
    
  }

}