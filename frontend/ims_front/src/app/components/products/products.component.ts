import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { Product, Menu } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { StocksService } from 'src/app/services/stocks/stocks';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  deletingMenu?: Menu | null = null;
  deletingProduct?: Product | null = null;

  proceedEditMenu: boolean = false;
  proceedEditProduct: boolean = false;
  proceedPayment: boolean = false;

  showMenuForm: boolean = false;
  showMenuTable: boolean = true; 
  showFormContainer: boolean = false; 
  updatingMenuItems: boolean = false;

  showMenuActionModal: boolean = false;
  showProductActionModal: boolean = false;
  showInvoice: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faRectangleList = faRectangleList;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;

  menus: Menu[] = [];
  products: Product[] = [];
  stocks: Stock[] = [];
  amountChange: number = 0;

  menu: Menu = {
    id: undefined,
    code: undefined,
    name: "",
    description: "",
    category: "",
    price: 0,
    status: true,
  };

  customCategory: string = "";

  product: Product = {
    id: undefined,
    code: undefined,
    stock_id: undefined,
    qty_per_order: 1,
  }

  constructor(
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
    ) {}

  resetMenuForm() {
    this.proceedEditProduct = false;

    this.menu = {
    code: undefined,
    name: "",
    description: "",
    category: "liquor",
    status: true,
    price: 0,
    }

    this.customCategory = "";
  }
  
  resetProductForm() {
    this.proceedEditProduct = false;
    this.product.code = undefined;
    this.product.stock_id = undefined,
    this.product.qty_per_order = 0;
  }

  toggleProceedPayment() {
    this.proceedPayment = !this.proceedPayment;
    if (!this.proceedPayment) {
      // this.menu.amount_tendered = 0;
    }
  } 

  async toggleInvoice() {
    this.showInvoice = !this.showInvoice;
    if (!this.showInvoice) {
      await this.uiService.wait(100);
      window.alert('Transaction has been completed successfully!')
      this.loadMenus();
      this.viewMenuProducts(this.menu);
    }
  }

  toggleMenuActionModal() {
    this.showMenuActionModal = !this.showMenuActionModal;
  }

  toggleProductActionModal() {
    this.showProductActionModal = !this.showProductActionModal;
  }

  toggleMenuTable() {
    this.showMenuTable = !this.showMenuTable;
  }

  toggleFormContainer() {
    this.showFormContainer = !this.showFormContainer;
  }

  toggleMenuForm() {
    this.showMenuForm = !this.showMenuForm;
    if (!this.showMenuForm) {
      this.resetMenuForm();
    }
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showInvoice) {
        this.toggleInvoice(); 
      } else if (this.showProductActionModal) {
        this.toggleProductActionModal();
      } else if (this.showMenuActionModal) {
        this.toggleMenuActionModal();
      } else if (this.showMenuForm) {
        this.toggleMenuForm();
      } else if (this.proceedPayment) {
        this.toggleProceedPayment();
      }
    }
  }

  viewMenuProducts(menu: Menu) {
    this.menu = menu;
    this.loadProducts();
    this.toggleFormContainer();
    this.toggleMenuTable();

    this.updatingMenuItems = !this.updatingMenuItems;
    if (!this.updatingMenuItems) {
      this.resetMenuForm();
      this.loadProducts();
    }
  }

  increaseQtyInput(): void {
    this.product.qty_per_order ++;
  }

  decreaseQtyInput(): void {
    if (this.product.qty_per_order < 1) {
      return;
    }
    this.product.qty_per_order --;
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadMenus();
    this.loadProducts();
    this.loadMenus();
    this.loadStocks();
  }  

  loadMenus() {
    this.productService
      .getMenus()
      .subscribe(menus => {
        this.menus = menus;
      });
  }

  loadProducts() {
    this.productService
      .getProducts()
      .subscribe((products) => {
        if (this.updatingMenuItems) {
          this.products = products.filter(product => product.code === this.menu.id);
        } else {
          this.products = products.filter(product => product.code === null);
        }
      });
  }

  loadStocks() {
    this.stockService
      .getStocks()
      .subscribe(stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
      })
  }

  onSubmitMenu() {
    if (this.proceedEditMenu) {
      this.onSaveUpdateMenu();
    } else {
      this.addMenu();
    }
  }

  // Add Menu
  addMenu() {

    if (!this.menu.name) {
      window.alert("Enter name");
      return;
    } else if (!this.menu.category) {
      window.alert("Enter category");
      return;
    }
    
    const newMenu = {
      ...this.menu,
      name: this.menu.name.toUpperCase(),
      category: this.menu.category.toUpperCase() || this.customCategory.toUpperCase(),
    }

    const isMenuNameExist = this.menus.some(menu => menu.name === newMenu.name);
  
    if (isMenuNameExist) {
      window.alert("Menu with this name already exists!");
      return;
    } else {
      this.productService.addMenu(newMenu)
      .subscribe(async (menu) => {
        this.menus.push(menu);
        const lastMenuId = this.menus.length - 1;
        this.products.map(product => {
          if (!product.code) {
            product.code = this.menus[lastMenuId].id;
          }
          this.productService.updateProduct(product).subscribe(product => {
            const index = this.products.findIndex(i => i.id === product.id);
            this.products[index] = product;
            this.loadProducts();
          })
        })
        this.resetMenuForm();
        this.toggleFormContainer();
        await this.uiService.wait(100);
        window.alert("New menu has been created successfully!");
      });
    }
  }

  // Add Items
  addProduct() {
    if (!this.product.stock_id) {
      window.alert("Select a product!");
      return;
    } else if (!this.product.qty_per_order || this.product.qty_per_order <= 0) {
      window.alert("Enter quantity!");
      return;
    }
    
    this.product.code = this.menu.id;

    const newProduct = {
      ...this.product,
    }

    this.productService.addProduct(newProduct)
      .subscribe(async (product) => {
        this.products.push(product);
        this.loadProducts();
        this.resetProductForm();
        await this.uiService.wait(100);
      });
  }

  // UPDATE MENU
  updateMenu(menu: Menu) {
    this.proceedEditMenu = true;

    menu.name.toUpperCase();
    menu.category.toUpperCase();
    
    this.menu = menu;

    this.toggleMenuForm();
  }

  onSaveUpdateMenu() {
    const editingMenu = {
      ...this.menu,
      name: this.menu.name.toUpperCase(),
      category: this.menu.category.toUpperCase(),
      description: this.menu.description.toUpperCase(),
    }

    const isMenuNameExist = this.menus.some(menu => menu.id !== editingMenu.id && menu.name === editingMenu.name);

    if (isMenuNameExist) {
      window.alert("Menu with this name already exists!");
      return;
    } else {
      this.productService
      .updateMenu(editingMenu)
      .subscribe(async (menuData) => {
        const index = this.menus.findIndex(menu => menu.id === menuData.id);
        this.menus[index] = menuData;
        this.toggleMenuForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the menu details.");
      });
    }
  }
  
  // DELETE MENU
  deleteMenu(menu: Menu) {
    this.deletingMenu = menu;
    this.toggleMenuActionModal();
  }

  onConfirmDeleteMenu() {
    if (!this.deletingMenu) {
      return;
    }

    this.productService
      .deleteMenu(this.deletingMenu)
      .subscribe(async () => {
        this.menus = this.menus.filter(s => s.id !== this.deletingMenu?.id);
        this.deletingMenu = null;
        this.toggleMenuActionModal()
        await this.uiService.wait(100);
        window.alert("Menu has been deleted successfully!");
      });
  }

  getStockDetails(stockId: any): {stock_name: string, code?: string} {
    const foundStock = this.stocks.find(menu => menu.id === stockId);
    if (foundStock) {
      return {
        stock_name: foundStock.stock_name,
        code: foundStock.code,
      }
    } else {
      return {
        stock_name: "Stock not found!",
        code: "Stock not found!",
      }
    }
  }

  onSubmitProduct() {
    if (this.proceedEditProduct) {
      this.saveProductUpdate();
    } else {
      this.addProduct();
    }
  }

  onStockSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewStock') {
      this.router.navigate(['stocks/']);
    }
  }

  // UPDATE PRODUCT
  updateProduct(product: Product) {
    this.proceedEditProduct = true;
    this.product = {...product};
  }

  saveProductUpdate() {
    const editingProduct = {
      ...this.product
    }

    this.productService
      .updateProduct(editingProduct)
      .subscribe(async (productData) => {
        const index = this.products.findIndex(product => product.id === productData.id);

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the item.");

        this.products[index] = productData;
      });
  }

  // DELETE PRODUCT
  deleteProduct(product: Product) {
    this.deletingProduct = product;
    this.toggleProductActionModal();
  }

  onConfirmDeleteProduct() {
    if (!this.deletingProduct) {
      return;
    }

    this.productService
      .deleteProduct(this.deletingProduct)
      .subscribe(async () => {
        this.menus = this.menus.filter(s => s.id !== this.deletingProduct?.id);
        this.deletingProduct = null;
        this.toggleProductActionModal()
        this.loadProducts();
        await this.uiService.wait(100);
        window.alert("Product has been deleted successfully!");
      });
  }

  onBillOut() {
    this.toggleInvoice();
    if (this.showInvoice) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
    }

    this.productService.updateMenu(this.menu)
      .subscribe(menu => {
        const index = this.menus.findIndex(menu => menu.id === menu.id);
        this.menus[index] = menu;
        this.loadMenus();
      });
  }

  onPayment() {
    // if (this.menu.grand_total) {
    //   if (this.menu.amount_tendered < this.menu.grand_total) {
    //     window.alert("Invalid amount tendered!");
    //     return;
    //   }
    // }

    this.productService.updateMenu(this.menu).subscribe((menu) => {
      if (menu.price) {
        this.toggleInvoice();
        this.toggleProceedPayment();
      }
    });
  }
}