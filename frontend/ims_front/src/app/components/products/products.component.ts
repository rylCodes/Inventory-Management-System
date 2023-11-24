import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { StocksService } from 'src/app/services/stocks/stocks';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  deletingProduct?: Product | null = null;
  proceedEdit: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  products: Product[] = [];
  stocks: Stock[] = [];

  id?: number; 
  code: string = "";
  product_name: string = "";
  stock_id?: number;
  category: string = "liquor";
  qty_per_order: number = 0;
  price: number = 0;
  status: boolean = true;

  customCategory: string = "";

  showForm: boolean = false;
  showActionModal: boolean = false;

  constructor(
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
    ) {}

  resetForm() {
    this.proceedEdit = false;
    this.code = "";
    this.product_name = "";
    this.stock_id = 0,
    this.category = "liquor";
    this.qty_per_order = 0;
    this.status = true;
    this.price = 0,
    this.customCategory = "";
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW PRODUCTS
  ngOnInit(): void {
    this.productService
      .getProducts()
      .subscribe((products) => {
        this.products = products;
      });

    this.stockService
      .getStocks()
      .subscribe(stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
      });
  }

  getStockDetails(stockId: any): {stockName: string, stockUnit: string, stockCode: string} {
    const foundStock = this.stocks.find(stock => stock.id === stockId);
    if (foundStock) {
      return {
        stockName: foundStock.stock_name,
        stockCode: foundStock.code,
        stockUnit: foundStock.unit
      }
    } else {
      return {
        stockName: "Stock not found!",
        stockCode: "Stock not found!",
        stockUnit: "Stock not found!",
      }
    }
  } 

  onSubmit() {
    if (this.proceedEdit) {
      this.onSaveUpdate();
    } else {
      this.addProduct();
    }
  }

  // CREATE PRODUCT
  addProduct() {
    if (!this.product_name) {
      window.alert("Enter product name!");
      return;
    } else if (this.qty_per_order <= 0) {
      window.alert("Enter quantity per order!")
      return;
    } else if (this.price < 0) {
      window.alert("Invalid price!");
      return;
    }

    const newProduct = {
      id: this.id,
      code: this.code,
      product_name: this.product_name.toUpperCase(),
      stock_id: this.stock_id,
      category: this.category.toUpperCase() || this.customCategory.toUpperCase(),
      qty_per_order: this.qty_per_order,
      price: this.price,
      status: this.status,
    }

    const isNameExist = this.products.some(product => product.product_name === newProduct.product_name);
  
    if (isNameExist) {
      window.alert("Product with this name already exists!");
    } else if (!this.product_name) {
      window.alert("Enter product name!");
      return;
    } else if (this.qty_per_order <= 0) {
      window.alert("Enter quantity per order!")
      return;
    } else if (this.price < 0) {
      window.alert("Invalid price!");
      return;
    } else {
      this.productService.addProduct(newProduct)
      .subscribe(async (product) => {
        this.products.push(product);
        this.resetForm();
        this.toggleForm();
        
        await this.uiService.wait(100);
        window.alert("New product has been created successfully!");
      });
    }
  }

  onStockSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewStock') {
      this.toggleForm();
      this.router.navigate(['stocks/']);
    }
  }

// UPDATE PRODUCT
updateProduct(product: Product) {
  this.proceedEdit = true;

  this.id = product.id;
  this.code = product.code;
  this.product_name = product.product_name.toUpperCase();
  this.stock_id = product.stock_id;
  this.category = product.category.toUpperCase();
  this.qty_per_order = product.qty_per_order;
  this.price = product.price;
  this.status = product.status;

  this.toggleForm();
}

onSaveUpdate() {
  const editingProduct = {
    id: this.id,
    code: this.code,
    product_name: this.product_name.toUpperCase(),
    stock_id: this.stock_id,
    category: this.category.toUpperCase() || this.customCategory.toUpperCase(),
    qty_per_order: this.qty_per_order,
    price: this.price,
    status: this.status,
  }
  const isNameExist = this.products.some(product => product.id !== editingProduct.id && product.product_name === editingProduct.product_name);

  if (isNameExist) {
    window.alert("Product with this name already exists!");
  } else {
      this.productService
      .editProduct(editingProduct)
      .subscribe(async (productData) => {
        const index = this.products.findIndex(product => product.id === productData.id);

        this.toggleForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the product.");

        this.products[index] = productData;
      });
    }
  }

  // DELETE PRODUCT
  deleteProduct(product: Product) {
    if (this.products.length <= 1) {
      window.alert("Please create a new product before deleting this one! Consider editing this product instead of deletion.");
      return;
    } else {
      this.deletingProduct = product;
      this.toggleActionModal();
    }
  }

  onConfirmDelete() {
    if (!this.deletingProduct) {
      return;
    }

    this.productService
      .deleteProduct(this.deletingProduct)
      .subscribe(async () => {
        this.products = this.products.filter(s => s.id !== this.deletingProduct?.id);
        this.deletingProduct = null;
        this.toggleActionModal()
        await this.uiService.wait(100);
        window.alert("Product has been deleted successfully!");
      });
  }

}