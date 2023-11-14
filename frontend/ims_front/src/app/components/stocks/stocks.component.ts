import { Component, OnDestroy, OnInit } from '@angular/core';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription } from 'rxjs';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css'],
})
export class StocksComponent implements OnInit, OnDestroy {
  deletingStock?: Stock | null = null;
  proceedEdit: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  stocks: Stock[] = [];

  id?: number; 
  code: string = "";
  name: string = "";
  description: string = "";
  quantity: number = 0;
  unit: string = "piece";
  status: boolean = true;
  customUnit: string = "";

  showForm: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(private stockService: StocksService, private uiService: UiService) {
    this.formSubscription = this.uiService
      .onToggleForm()
      .subscribe((value: boolean) => {this.showForm = value});
  }

  resetForm() {
    this.code = "";
    this.name = "";
    this.description = "";
    this.quantity = 0;
    this.unit = "piece";
    this.status = true;
    this.customUnit = "";
  }

  toggleForm() {
    if (this.proceedEdit) {
      this.toggleEditStock();
    } else {
      this.toggleAddStock();
    }
  }

  toggleEditStock() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.proceedEdit = false;
      this.resetForm();
    }
  }

  toggleAddStock() {
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

  // SHOW STOCKS
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

  onSubmit() {
    if (this.proceedEdit) {
      this.onSaveUpdate();
    } else {
      this.addStock();
    }
  }

  // CREATE STOCK
  addStock() {
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

    const isCodeExist = this.stocks.some(stock => stock.code === newStock.code);
    const isNameExist = this.stocks.some(stock => stock.name === newStock.name);
  
    if (isCodeExist) {
      window.alert("Stock with this code already exists!");
    } else if (isNameExist) {
      window.alert("Stock with this name already exists!");
    } else {
      this.stockService.addStock(newStock)
      .subscribe(async (stock) => {
        this.stocks.push(stock);
        this.resetForm();
        this.showForm = false;
        await this.uiService.wait(100);
        window.alert("New stock has been created successfully!");
      });
    }
  }

  // DELETE STOCK
  deleteStock(stock: Stock) {
    console.log(this.showForm);
    this.proceedEdit = false;
    this.deletingStock = stock;
    this.toggleActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingStock) {
      return;
    }

    this.stockService
      .deleteStock(this.deletingStock)
      .subscribe(async () => {
        this.stocks = this.stocks.filter(s => s.id !== this.deletingStock?.id);
        this.deletingStock = null;
        this.toggleActionModal()
        await this.uiService.wait(100);
        window.alert("Stock has been deleted successfully!");
      });
  }

// UPDATE STOCK
updateStock(stock: Stock) {
  this.proceedEdit = true;

  this.id = stock.id;
  this.code = stock.code;
  this.name = stock.name;
  this.description = stock.description;
  this.quantity = stock.quantity;
  this.unit = stock.unit;
  this.status = stock.status;

  this.toggleForm();
}

onSaveUpdate() {
  const editingStock = {
    id: this.id,
    code: this.code,
    name: this.name,
    description: this.description,
    quantity: this.quantity,
    unit: this.unit,
    status: this.status,
  }
  const isCodeExist = this.stocks.some(stock => stock.id !== editingStock.id && stock.code === editingStock.code);
  const isNameExist = this.stocks.some(stock => stock.id !== editingStock.id && stock.name === editingStock.name);

  if (isCodeExist) {
    window.alert("Stock with this code already exists!");
  } else if (isNameExist) {
    window.alert("Stock with this name already exists!");
  } else {
      this.stockService
      .editStock(editingStock)
      .subscribe(async (stockData) => {
        const index = this.stocks.findIndex(stock => stock.id === stockData.id);

        this.showForm = false;
        this.proceedEdit = false;
        this.resetForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the stock.");

        this.stocks[index] = stockData;
      });
    }
  }
}