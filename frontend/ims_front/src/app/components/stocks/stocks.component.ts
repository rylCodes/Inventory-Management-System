import { Component, OnInit } from '@angular/core';
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
export class StocksComponent implements OnInit {
  searchQuery: string = "product";
  deletingStock?: Stock | null = null;
  proceedEdit: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  stocks: Stock[] = [];

  id?: number; 
  code: string = "";
  stock_name: string = "";
  description: string = "";
  quantity: number = 0;
  unit: string = "piece";
  date_added?: string;
  date_updated?: string;
  status: boolean = true;
  customUnit: string = "";

  showForm: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(private stockService: StocksService, private uiService: UiService) {}

  resetForm() {
    this.stock_name = "";
    this.description = "";
    this.quantity = 0;
    this.unit = "piece";
    this.status = true;
    this.customUnit = "";
  }

  toggleForm() {    
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.proceedEdit = false;
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW STOCKS
  ngOnInit(): void {
    this.stockService
      .getStocks()
      .subscribe((stocks) => {
        // const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = stocks;
      });
  }

  onSubmit() {
    if (this.proceedEdit) {
      this.saveUpdate();
    } else {
      this.addStock();
    }
  }

  // CREATE STOCK
  addStock() {
    if (!this.stock_name) {
      window.alert("Enter stock name!");
      return;
    }

    if (this.quantity < 0) {
      window.alert("Invalid stock quantity!");
      return;
    }

    const newStock = {
      id: this.id,
      code: this.code,
      stock_name: this.stock_name.toUpperCase(),
      description: this.description.toUpperCase(),
      quantity: this.quantity,
      unit: this.unit || this.customUnit,
      date_added: this.date_added,
      date_updated: this.date_updated,
      status: this.status,
    }

    const isStockNameExist = this.stocks.some(stock => stock.stock_name === newStock.stock_name);
  
    if (isStockNameExist) {
      window.alert("Stock with this name already exists!");
    } else {
      this.stockService.addStock(newStock)
      .subscribe(async (stock) => {
        this.stocks.push(stock);
        this.toggleForm();
        await this.uiService.wait(100);
        window.alert("New stock has been created successfully!");
      });
    }
  }

  // DELETE STOCK
  deleteStock(stock: Stock) {
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
  this.stock_name = stock.stock_name.toUpperCase();
  this.description = stock.description.toUpperCase();
  this.quantity = stock.quantity;
  this.unit = stock.unit;
  this.date_added = stock.date_added;
  this.date_updated = stock.date_updated;
  this.status = stock.status;
  this.toggleForm();
}

saveUpdate() {
  const editingStock = {
    id: this.id,
    code: this.code,
    stock_name: this.stock_name.toUpperCase(),
    description: this.description.toUpperCase(),
    quantity: this.quantity,
    unit: this.unit || this.customUnit,
    date_added: this.date_added,
    date_updated: this.date_updated,
    status: this.status,
  }

  const isStockNameExist = this.stocks.some(stock => stock.id !== editingStock.id && stock.stock_name === editingStock.stock_name);

  if (isStockNameExist) {
    window.alert("Stock with this name already exists!");
    return;
  } else {
      this.stockService
      .editStock(editingStock)
      .subscribe(async (stockData) => {
        const index = this.stocks.findIndex(stock => stock.id === stockData.id);
        this.stocks[index] = stockData;
        this.toggleForm();
        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the stock.");
      });
    }
  }
}