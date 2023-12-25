import { Component, OnInit, Renderer2, HostListener, ViewChild } from '@angular/core';
import { Product, Menu } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { ProductsService } from 'src/app/services/products/products.service';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { UiService } from 'src/app/services/ui/ui.service';

import {
  faPen, faTrashCan, faXmark, faRectangleList,
  faPlus, faMinus, faTimes, faEllipsisVertical
} from '@fortawesome/free-solid-svg-icons';

import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { SaleItem } from 'src/app/interface/Sale';
import { SalesService } from 'src/app/services/sales/sales.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  @ViewChild('tableSettings', {static: true}) tableSettings: any;

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if(!(event.target as HTMLElement).closest('#tableSettings')) {
      this.showSortOrDelItems = false;
    };
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showProductActionModal) {
        this.toggleProductActionModal();
      } else if (this.showMenuActionModal) {
        this.toggleMenuActionModal();
      } else if (this.showMenuForm) {
        this.toggleMenuForm();
      } else if (this.showSearchBar) {
        this.showSearchBar = false;
      }
    }
  }

  private query = new Subject<string>();
  searchQuery: string = "";
  filterText: string= "";
  isFilter: boolean = false;
  isAscending: boolean = true;
  isSortedAToZ: boolean = true;

  p: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  deletingMenu?: Menu | null = null;
  deletingProduct?: Product | null = null;

  isFetching: boolean = false;
  isLoading: boolean = false;

  proceedEditMenu: boolean = false;
  proceedEditProduct: boolean = false;
  proceedPayment: boolean = false;

  showSearchBar: boolean = false;
  showTableSettings: boolean = true;
  showSortOrDelItems: boolean = false;
  showForm: boolean = false;
  showModal: boolean = false;

  showMenuForm: boolean = false;
  showMenuTable: boolean = true; 
  showFormContainer: boolean = false; 
  updatingMenuItems: boolean = false;

  showMenuActionModal: boolean = false;
  showProductActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faRectangleList = faRectangleList;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;
  faEllipsisVertical = faEllipsisVertical;

  menus: Menu[] = [];
  products: Product[] = [];
  stocks: Stock[] = [];
  saleItems: SaleItem[] = [];

  menu: Menu = {
    id: undefined,
    code: undefined,
    name: "",
    description: "",
    category: "",
    price: 0,
    status: true,
  };

  originalMenu: Menu = {
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
    menu: undefined,
    stock_id: undefined,
    qty_per_order: 1,
  }

  constructor(
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
      private saleService: SalesService,
      private toastrService: ToastrService,
    ) {}

  resetMenuForm() {
    this.menu = {
      id: undefined,
      code: "",
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
    this.product.menu = undefined;
    this.product.stock_id = undefined,
    this.product.qty_per_order = 1;
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
    this.toggleTableSettings();
    this.toggleMenuTable();
  }

  toggleMenuForm() {
    this.showMenuForm = !this.showMenuForm;
    if (!this.showMenuForm) {
      this.proceedEditMenu = false;
      this.resetMenuForm();
    }
  }

  viewMenuProducts(menu: Menu) {
    this.menu = menu;
    this.toggleFormContainer();

    this.updatingMenuItems = !this.updatingMenuItems;
    if (!this.updatingMenuItems) {
      this.resetMenuForm();
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

  // SHOW PRODUCTS
  ngOnInit(): void {
    this.loadSaleItems();
    this.loadProducts();
    this.loadStocks();
    this.loadMenus();
  }
  
  loadSaleItems() {
    this.saleService
    .getSaleItems()
    .subscribe({
      next: items => {
        this.saleItems = items;
      },
      error: err => console.log(err),
    });
  }

  loadMenus() {
    this.productService
    .getMenus(this.filterText)
    .subscribe({
      next: menus => {
        this.menus = menus;
        menus.forEach(menu => {
          if (!menu.status) {
            this.updateRelatedSaleItem(menu);
          }
        })
      },
      error: err => this.uiService.displayErrorMessage(err),
    });
  }

  loadProducts() {
    this.isFetching = true;
    this.productService
    .getProducts()
    .subscribe({
      next: (products) => {
        this.isFetching = false;

        if (this.updatingMenuItems) {
          this.products = products.filter(product => product.menu === this.menu.id);
        } else {
          this.products = products.filter(product => product.menu === null);
        }

        this.productService
        .getMenus().subscribe(menus => {
          const menuWithOutProduct = menus.filter(menu => {
            return !products.some(product => product.menu === menu.id);
          });

          menuWithOutProduct.map(menu => {
            menu.status = false;
            this.productService.updateMenu(menu).subscribe();
          });
        });
      },
      error: (err) => {
        this.isFetching = false;
        console.log(err);
      }
    });
  }

  loadStocks() {
    this.stockService
      .getStocks()
      .subscribe({
        next: stocks => {
          const activeStocks = stocks.filter(stock => stock.status === true);
          this.stocks = activeStocks;
        },
        error: err => console.log(err)
      })
  }

  onSubmitMenu() {
    if (this.proceedEditMenu) {
      this.onSaveUpdateMenu();
    } else {
      this.addMenu();
    }
  }

  // Create Product
  addMenu() {
    if (!this.menu.name) {
      this.toastrService.error("Enter name");
      return;
    } else if (!this.menu.category) {
      this.toastrService.error("Enter category");
      return;
    } else if (this.menu.price < 0 || this.menu.price === null) {
      this.toastrService.error("Invalid price input!");
      return;
    }

    if (this.menu.category === "otherCategory" && this.customCategory) {
      this.menu.category = this.customCategory;
    }

    const is_staff = sessionStorage.getItem("is_staff");
    if (is_staff === "false") {
      this.menu.status = false;
    }
    
    const newMenu = {
      ...this.menu,
      name: this.menu.name.toUpperCase(),
      category: this.menu.category.toUpperCase(),
      description: this.menu.description.toUpperCase()
    }

    const isMenuNameExist = this.menus.some(menu => menu.name === newMenu.name);
  
    if (isMenuNameExist) {
      this.toastrService.error("Product with this name already exists!");
      return;
    } else if (this.products.length < 1) {
      this.toastrService.error("Please add at least one item to the product.");
      return;
    } else {
      this.isLoading = true;
      this.productService.addMenu(newMenu)
      .subscribe({
        next: async (menu) => {
          this.isLoading = false;
          this.menus.push(menu);
          
          const lastMenuId = this.menus.length - 1;
          this.products.map(product => {
            if (!product.menu) {
              product.menu = this.menus[lastMenuId].id;
            }
            this.productService.updateProduct(product).subscribe({
              error: err => console.log(err),
            })
          })
          this.resetMenuForm();
          this.resetProductForm();
          this.toggleFormContainer();
          await this.uiService.wait(100);
          if (!menu.price || menu.price < 1) {
            this.toastrService.warning(
              "You have saved a product without a price amount. Make sure it is correct.",
              "Zero Price!",
              {timeOut: 5000}
            );
          }
          this.toastrService.success("Success: New product has been added to the menu.");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
    }
  }

  // Add Items
  addProduct() {
    if (!this.product.stock_id) {
      this.toastrService.error("Select an item!");
      return;
    } else if (!this.product.qty_per_order || this.product.qty_per_order <= 0) {
      this.toastrService.error("Enter quantity");
      return;
    }
    
    this.product.menu = this.menu.id;

    const newProduct = {
      ...this.product,
    }

    this.productService.addProduct(newProduct).subscribe({
      next: async (product) => {
        this.resetProductForm();
        await this.uiService.wait(100);
      },
      error: (err) => {
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  // UPDATE MENU
  updateMenu(menu: Menu) {
    this.proceedEditMenu = true;
    this.menu = { ...menu };
    this.originalMenu = { ...menu };
    this.toggleMenuForm();
  }

  onSaveUpdateMenu() {
    if (!this.menu.name) {
      this.toastrService.error("Enter name");
      return;
    } else if (!this.menu.category) {
      this.toastrService.error("Enter category");
      return;
    } else if (this.menu.price < 0 || this.menu.price === null) {
      this.toastrService.error("Invalid price input!");
      return;
    }

    if (JSON.stringify(this.originalMenu) === JSON.stringify(this.menu)) {
      this.toggleMenuForm();
      return;
    }

    if (this.menu.category === "otherCategory" && this.customCategory) {
      this.menu.category = this.customCategory;
    }

    const editingMenu = {
      ...this.menu,
      name: this.menu.name.toUpperCase(),
      category: this.menu.category.toUpperCase(),
      description: this.menu.description? this.menu.description.toUpperCase() : "",
    }

    const isMenuNameExist = this.menus.some(menu => menu.id !== editingMenu.id && menu.name === editingMenu.name);

    if (isMenuNameExist) {
      this.toastrService.error("Product with this name already exists!");
      return;
    } else {
      this.isLoading = true;
      this.productService
      .updateMenu(editingMenu)
      .subscribe({
        next: async (menuData) => {
          this.updateRelatedSaleItem(menuData);

          this.isLoading = false;
          const index = this.menus.findIndex(menu => menu.id === menuData.id);
          this.menus[index] = menuData;
          this.toggleMenuForm();
  
          await this.uiService.wait(100);
          this.toastrService.success("Successfully saved changes to the product details.");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
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

    this.isLoading = true;
    this.productService
      .deleteMenu(this.deletingMenu)
      .subscribe({
        next: async () => {
          this.isLoading = false;
          this.menus = this.menus.filter(s => s.id !== this.deletingMenu?.id);
          this.deletingMenu = null;
          this.toggleMenuActionModal()
          await this.uiService.wait(100);
          this.toastrService.success("Product has been deleted successfully.");
        },
        error: (err) => {
          this.isLoading = false;
          this.showMenuActionModal = false;
          this.uiService.displayErrorMessage(err);
        }
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
    if (target.value === 'addNewItem') {
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

    this.isLoading = true;
    this.productService
      .updateProduct(editingProduct)
      .subscribe({
        next: async (productData) => {
          this.isLoading = false;
          const index = this.products.findIndex(product => product.id === productData.id);
  
          await this.uiService.wait(100);
          this.toastrService.success("Successfully saved changes to the item.");
  
          this.products[index] = productData;
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

  // DELETE PRODUCT
  deleteProduct(product: Product) {
    this.deletingProduct = product;
    if (!this.updatingMenuItems) {
      this.onConfirmDeleteProduct();
    } else {
      this.toggleProductActionModal();
    }
  }

  onConfirmDeleteProduct() {
    if (!this.deletingProduct) {
      return;
    }

    this.productService
    .deleteProduct(this.deletingProduct)
    .subscribe({
      next: async () => {
        this.menus = this.menus.filter(s => s.id !== this.deletingProduct?.id);
        this.deletingProduct = null;
        this.showProductActionModal = false;
        await this.uiService.wait(100);
        this.toastrService.success("Item has been deleted successfully!");
      },
      error: (err) => {
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  updateRelatedSaleItem(menuData: Menu) {
    const relatedSaleItems = this.saleItems.filter(item => item.menu === menuData.id);
    if (!menuData.status) {
      relatedSaleItems.forEach(item => {
        item.status = false;
        this.saleService.editSaleItem(item).subscribe();
      });
    } else {
      relatedSaleItems.forEach(item => {
        item.status = true;
        this.saleService.editSaleItem(item).subscribe();
      });
    }
  }

  onSearch() {
    if (this.searchQuery) {
      this.filterText = this.searchQuery
      this.isFilter = true;
      this.searchQuery = "";
      this.setQuery(this.filterText)

      if (!this.stocks.length) {
        return;
      } else {
        this.loadMenus();
      }
    }
  }

  removeFilter() {
    this.filterText = "";
    this.searchQuery = "";
    this.isFilter = false;
    this.loadMenus();
  }

  setQuery(query: string) {
    this.query.next(query);
  }

  clearText() {
    this.filterText = "";
    this.searchQuery = "";
  }

  onSearchChanged(value: string): void {
    console.log(value)
    this.searchQuery = value;
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  toggleShowSearchBar() {
    this.showSearchBar = !this.showSearchBar;
  }

  toggleTableSettings() {
    this.showTableSettings = !this.showTableSettings;
  }

  toggleSortOrDelItems() {
    this.showSortOrDelItems = !this.showSortOrDelItems
  }

  deleteAllItems() {
    this.showSortOrDelItems = false;
    this.toggleModal();
    
    if (this.menus.length) {
      this.toastrService.warning('Caution: All products will be deleted permanently!', undefined, { timeOut: 5000});
    }
  }

  onConfirmDeleteAll() {
    if (!this.menus.length) {
      this.showModal = false;
      return;
    }
    
    let deletingMenus: Observable<Menu>[] = [];

    this.menus.forEach(menu => {
      deletingMenus.push(this.productService.deleteMenu(menu));
    });

    forkJoin(deletingMenus).subscribe({
      next: () => {
        this.showModal = false;
        this.toastrService.success("All products has been deleted successfully.");
      },
      error: (err) => {
        this.showModal = false;
        this.uiService.displayErrorMessage(err);
      }
    })
  }

  sortItemsByDate() {
    this.menus.sort((a, b): any => {
      if (a.date_updated && b.date_updated) {
        const dateA = Date.parse(a.date_updated);
        const dateB = Date.parse(b.date_updated)
        let comparison = dateA - dateB;

        if (!this.isAscending) {
          comparison *= -1;
        }

        return comparison;
      }
    });

    this.toggleSortOrDelItems();
    this.isAscending = !this.isAscending;
  }

  sortItemsByName() {
    this.menus.sort((a, b): any => {
      if (a.name && b.name) {
        let comparison = a.name.localeCompare(b.name);
  
        if (!this.isSortedAToZ) {
          comparison *= -1;
        }
  
        return comparison;
      }
    });
  
    this.toggleSortOrDelItems();
    this.isSortedAToZ = !this.isSortedAToZ;
  }

  // Class ends here.
}