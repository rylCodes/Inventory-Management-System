import { Component, OnInit } from '@angular/core';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription } from 'rxjs';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css'],
})
export class StocksComponent implements OnInit {
  searchQuery: string = "product";
  deletingStock?: Stock | null = null;
  proceedEdit: boolean = false;
  isLoading: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  stocks: Stock[] = [];

  stock: Stock = {
    id: undefined,
    code: "",
    stock_name: "",
    description: "",
    quantity: 0,
    unit: "",
    status: true,
  }

  originalStock: Stock = {
    id: undefined,
    code: "",
    stock_name: "",
    description: "",
    quantity: 0,
    unit: "",
    status: true,
  }

  customUnit: string = "";

  showForm: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(private stockService: StocksService, private uiService: UiService) {}

  resetForm() {
    this.stock = {
      id: undefined,
      code: "",
      stock_name: "",
      description: "",
      quantity: 0,
      unit: "",
      status: true,
    }

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
    this.loadStocks();
  }

  loadStocks(): void {
    this.stockService
      .getStocks()
      .subscribe({
        next: (stocks) => {
          this.stocks = stocks;
        },
        error: (err) => {
          console.log(err);
          this.uiService.handleError(err);
        }
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
    if (!this.stock.stock_name) {
      window.alert("Enter stock name!");
      return;
    } else if (this.stock.quantity < 0 || this.stock.quantity === null) {
      window.alert("Invalid stock quantity!");
      return;
    }

    if (this.stock.unit === "otherUnit" && this.customUnit) {
      this.stock.unit = this.customUnit;
    }

    const newStock = {
      id: this.stock.id,
      code: this.stock.code,
      stock_name: this.stock.stock_name.toUpperCase(),
      description: this.stock.description.toUpperCase(),
      quantity: this.stock.quantity,
      unit: this.stock.unit,
      date_added: this.stock.date_added,
      date_updated: this.stock.date_updated,
      status: this.stock.status,
    }

    const isStockNameExist = this.stocks.some(stock => stock.stock_name === newStock.stock_name);
  
    if (isStockNameExist) {
      window.alert("Stock with this name already exists!");
    } else {
      this.isLoading = true;
      this.stockService.addStock(newStock)
      .subscribe({
        next: async (stock) => {
          this.isLoading = false;
          this.stocks.push(stock);
          this.toggleForm();
          await this.uiService.wait(100);
          window.alert("New stock has been created successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.handleError(err);
        }
      });
    }
  }

  // UPDATE STOCK
  updateStock(stock: Stock) {
    this.proceedEdit = true;
    this.stock = { ...stock };
    this.originalStock = { ...stock };
    this.toggleForm();
  }

  saveUpdate() {
    if (!this.stock.stock_name) {
      window.alert("Enter stock name!");
      return;
    } else if (this.stock.quantity < 0 || this.stock.quantity === null) {
      window.alert("Invalid stock quantity!");
      return;
    }

    if (JSON.stringify(this.originalStock) === JSON.stringify(this.stock)) {
      this.toggleForm();
      return;
    }

    if (this.stock.unit === "otherUnit" && this.customUnit) {
      this.stock.unit = this.customUnit;
    }

    const editingStock = {
      ...this.stock,
      stock_name: this.stock.stock_name.toUpperCase(),
      description: this.stock.description.toUpperCase(),
    }

    const isStockNameExist = this.stocks.some(stock => stock.id !== editingStock.id && stock.stock_name === editingStock.stock_name);

    if (isStockNameExist) {
      window.alert("Stock with this name already exists!");
      return;
    } else {
        this.stockService
        .editStock(editingStock)
        .subscribe({
          next: async (stockData) => {
            this.isLoading = false;
            const index = this.stocks.findIndex(stock => stock.id === stockData.id);
            this.stocks[index] = stockData;
            this.loadStocks();
            this.toggleForm();
            await this.uiService.wait(100);
            window.alert("Successfully saved changes to the stock.");
          },
          error: (err) => {
            this.isLoading = false;
            this.uiService.handleError(err);
          }
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

    this.isLoading = true;
    this.stockService
      .deleteStock(this.deletingStock)
      .subscribe({
        next: async () => {
          this.isLoading = false
          this.stocks = this.stocks.filter(s => s.id !== this.deletingStock?.id);
          this.deletingStock = null;
          this.toggleActionModal()
          await this.uiService.wait(100);
          window.alert("Stock has been deleted successfully!");
        },
        error: (err) => {
          if (err) {
            this.isLoading = false;
            this.uiService.handleError(err);
            this.toggleActionModal();
          }
        }
      });
  }
  

}