import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { StocksService } from 'src/app/services/stocks/stocks';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription, filter } from 'rxjs';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  deletingProduct?: Product | null = null;
  proceedEdit: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  products: Product[] = [];
  stocks: Stock[] = [];

  id?: number; 
  code: string = "";
  name: string = "";
  stock_name: number | undefined;
  description: string = "";
  qty_per_order: number = 0;
  price: number = 0;
  status: boolean = true;

  showForm: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router
    ) {
    this.formSubscription = this.uiService
      .onToggleForm()
      .subscribe((value: boolean) => {this.showForm = value});
  }

  resetForm() {
    this.proceedEdit = false;
    this.code = "";
    this.name = "";
    this.stock_name = undefined;
    this.description = "";
    this.qty_per_order = 0;
    this.status = true;
  }

  toggleForm() {
    if (this.showForm) {
      this.showForm = false;
    } 

    if (this.proceedEdit) {
      this.toggleEditProduct();
    } else {
      this.toggleAddProduct();
    }  
  }

  toggleEditProduct() {
    this.uiService.toggleForm();
    if (!this.showForm) {
      this.resetForm();
    }
  }

  toggleAddProduct() {
    this.uiService.toggleForm();
    if (!this.showForm) {
      this.resetForm();
    }
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

  // SHOW PRODUCTS
  ngOnInit(): void {
    this.productService
      .getProducts()
      .subscribe((products) => {
        const sortedProducts = products.sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
        this.products = sortedProducts;
      });

    this.stockService
      .getStocks()
      .subscribe(stocks => this.stocks = stocks);
  }

  getStockName(stockId: any): string {
    const foundStock = this.stocks.find(stock => stock.id === stockId);
    return foundStock ? foundStock.name : 'Stock Not Found';
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
    if (!this.name) {
      window.alert("Enter product name!");
      return;
    }

    if (this.qty_per_order < 0) {
      window.alert("Invalid product quantity!");
      return;
    }

    const newProduct = {
      code: this.code,
      name: this.name,
      stock_name: this.stock_name,
      description: this.description,
      qty_per_order: this.qty_per_order,
      price: this.price,
      status: this.status,
    }

    const isCodeExist = this.products.some(product => product.code === newProduct.code);
    const isNameExist = this.products.some(product => product.name === newProduct.name);
  
    if (isCodeExist) {
      window.alert("Product with this code already exists!");
    } else if (isNameExist) {
      window.alert("Product with this name already exists!");
    } else {
      this.productService.addProduct(newProduct)
      .subscribe(async (product) => {
        this.products.push(product);
        this.resetForm();
        this.showForm = false;
        await this.uiService.wait(100);
        window.alert("New product has been created successfully!");
      });
    }
  }

  onStockSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;

    if (target.value === 'addNewStock') {
      this.uiService.toggleForm();
      this.router.navigate(['stocks/']);
    }
  }

  // DELETE PRODUCT
  deleteProduct(product: Product) {
    console.log(this.showForm);
    this.proceedEdit = false;
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
  this.name = product.name;
  this.description = product.description;
  this.qty_per_order = product.qty_per_order;
  this.price = product.price;
  this.status = product.status;

  this.toggleForm();
}

onSaveUpdate() {
  const editingProduct = {
    id: this.id,
    code: this.code,
    name: this.name,
    stock_name: this.stock_name,
    description: this.description,
    qty_per_order: this.qty_per_order,
    price: this.price,
    status: this.status,
  }
  const isCodeExist = this.products.some(product => product.id !== editingProduct.id && product.code === editingProduct.code);
  const isNameExist = this.products.some(product => product.id !== editingProduct.id && product.name === editingProduct.name);

  if (isCodeExist) {
    window.alert("Product with this code already exists!");
  } else if (isNameExist) {
    window.alert("Product with this name already exists!");
  } else {
      this.productService
      .editProduct(editingProduct)
      .subscribe(async (productData) => {
        const index = this.products.findIndex(product => product.id === productData.id);

        this.showForm = false;
        this.resetForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the product.");

        this.products[index] = productData;
      });
    }
  }
}