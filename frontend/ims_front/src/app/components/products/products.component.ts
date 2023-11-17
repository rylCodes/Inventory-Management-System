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
  stock_name: number | undefined;
  description: string = "";
  qty_per_order: number = 0;
  price: number = 0;
  status: boolean = true;

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
    this.stock_name = undefined;
    this.description = "";
    this.qty_per_order = 0;
    this.status = true;
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
        const sortedProducts = products.sort((a, b) => {
          return a.product_name.localeCompare(b.product_name) 
        })
        this.products = sortedProducts;
      });

    this.stockService
      .getStocks()
      .subscribe(stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
      });
  }

  getStockName(stockId: any): string {
    const foundStock = this.stocks.find(stock => stock.id === stockId);
    return foundStock ? foundStock.stock_name : 'Stock Not Found';
  }
  
  getStockUnit(stockId: any): string {
    const foundStock = this.stocks.find(stock => stock.id === stockId);
    return foundStock ? foundStock.unit : 'Stock Not Found';
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

    const lastItem = this.products[this.products.length - 1];
    let lastItemNumber;

    if (lastItem) {
      lastItemNumber = Number(lastItem.code.split('-')[2]);
    } else {
      lastItemNumber = 0;
    }

    this.code = this.uiService.generateSequentialCode('PRO', lastItemNumber);

    const newProduct = {
      id: this.id,
      code: this.code,
      product_name: this.product_name.toUpperCase(),
      stock_name: this.stock_name,
      description: this.description.toUpperCase(),
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

  // DELETE PRODUCT
  deleteProduct(product: Product) {
    this.deletingProduct = product;
    this.toggleActionModal();
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

// UPDATE PRODUCT
updateProduct(product: Product) {
  this.proceedEdit = true;

  this.id = product.id;
  this.code = product.code;
  this.product_name = product.product_name.toUpperCase();
  this.stock_name = product.stock_name;
  this.description = product.description.toUpperCase();
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
    stock_name: this.stock_name,
    description: this.description.toUpperCase(),
    qty_per_order: this.qty_per_order,
    price: this.price,
    status: this.status,
  }
  const isCodeExist = this.products.some(product => product.id !== editingProduct.id && product.code === editingProduct.code);
  const isNameExist = this.products.some(product => product.id !== editingProduct.id && product.product_name === editingProduct.product_name);

  if (isCodeExist) {
    window.alert("Product with this code already exists!");
  } else if (isNameExist) {
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
}