import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Menu } from 'src/app/interface/Product';
import { Stock } from 'src/app/interface/Stock';
import { Product } from 'src/app/interface/Product';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';
import { StocksService } from 'src/app/services/stocks/stocks';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  deletingSaleBill?: SaleBill | null = null;
  deletingSaleItem?: SaleItem | null = null;

  proceedEditBill: boolean = false;
  proceedEditItem: boolean = false;
  proceedPayment: boolean = false;

  showBillForm: boolean = false;
  showBillTable: boolean = true;  
  updatingOrder: boolean = false;

  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;
  showInvoice: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faRectangleList = faRectangleList;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;

  activeBills: SaleBill[] = [];
  allBills: SaleBill[] = [];
  saleItems: SaleItem[] = [];
  menus: Menu[] = [];
  stocks: Stock[] = [];
  products: Product[] = [];
  amountChange: number = 0;

  saleBill: SaleBill = {
    id: undefined,
    billno: "",
    time: "",
    customer_name: "",
    remarks: "",
    amount_tendered: 0,
    grand_total: 0,
    status: false,
  };

  saleItem: SaleItem = {
    id: undefined,
    billno: null,
    menu: undefined,
    quantity: 1,
    price: 0,
    sale_date: "",
    sub_total: 0,
  }

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
    ) {}

  resetBillForm() {
    this.proceedEditBill = false;
    this.saleBill = {
      billno: "",
      time: "",
      customer_name: "",
      remarks: "",
      amount_tendered: 0,
      grand_total: 0,
    };
  }
  
  resetItemForm() {
    this.proceedEditItem = false;
    this.saleItem.billno = undefined;
    this.saleItem.menu = undefined;
    this.saleItem.quantity = 1;
    this.saleItem.sale_date = "";
    this.saleItem.sub_total = 0;
  }

  toggleProceedPayment() {
    const saleItems = this.saleItems;
    console.log('saleItems:', saleItems);

    const menuIDs = this.saleItems.map(item => item.menu);

    const filteredProducts = this.products.filter(product => menuIDs.includes(product.menu));
    console.log('filteredProducts', filteredProducts);

    const stockIDs = filteredProducts.map(stock => stock.stock_id);

    const filteredStocks = this.stocks.filter(stock => stockIDs.includes(stock.id))
    console.log('filteredStocks', filteredStocks);

    const quantity = saleItems.map((item, index) => item.quantity * filteredProducts[index].qty_per_order);
    console.log(quantity);

    this.proceedPayment = !this.proceedPayment;
    if (!this.proceedPayment) {
      this.saleBill.amount_tendered = 0;
    }
  } 

  async toggleInvoice() {
    this.showInvoice = !this.showInvoice;
    if (!this.showInvoice) {
      await this.uiService.wait(100);
      window.alert('Transaction has been completed successfully!')
      this.loadBills();
      this.viewOrder(this.saleBill);
    }
  }

  toggleBillActionModal() {
    this.showBillActionModal = !this.showBillActionModal;
  }

  toggleItemActionModal() {
    this.showItemActionModal = !this.showItemActionModal;
  }

  toggleBillTable() {
    this.showBillTable = !this.showBillTable;
  }

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
    if (!this.showBillForm) {
      this.resetBillForm();
    }
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showInvoice) {
        this.toggleInvoice(); 
      } else if (this.showItemActionModal) {
        this.toggleItemActionModal();
      } else if (this.showBillActionModal) {
        this.toggleBillActionModal();
      } else if (this.showBillForm) {
        this.toggleBillForm();
      } else if (this.proceedPayment) {
        this.toggleProceedPayment();
      }
    }
  }

  viewOrder(saleBill: SaleBill) {
    this.saleBill = saleBill;
    this.loadItems();
    this.toggleBillTable();

    this.updatingOrder = !this.updatingOrder;
    if (!this.updatingOrder) {
      this.resetBillForm();
      this.loadItems();
    }
  }

  calculateGrandtotal(saleItems: SaleItem[]): number {
    let grandTotal = 0;
    saleItems.forEach(item => {
      grandTotal += item.sub_total || 0;
    });

    return grandTotal;
  }

  increaseQtyInput(): void {
    this.saleItem.quantity ++;
  }

  decreaseQtyInput(): void {
    if (this.saleItem.quantity < 1) {
      return;
    }
    this.saleItem.quantity --;
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadBills();
    this.loadItems();
    this.loadMenus();
    this.loadStocks();
    this.loadProducts();
  }  

  loadBills() {
    this.salesService
      .getSaleBills()
      .subscribe(salesBills => {
        this.activeBills = salesBills.filter(item => !item.status);
        this.allBills = salesBills;
      });
  }

  loadItems() {
    this.salesService
      .getSaleItems()
      .subscribe((saleItems) => {
        if (this.updatingOrder) {
          this.saleItems = saleItems.filter(item => item.billno === this.saleBill.id);
          this.saleBill.grand_total = this.calculateGrandtotal(this.saleItems);
        } else {
          this.saleItems = saleItems.filter(item => item.billno === null);
          this.saleBill.grand_total = this.calculateGrandtotal(this.saleItems);
        }
      });
  }

  loadMenus() {
    this.productService
      .getMenus()
      .subscribe(menus => {
        const activeMenus = menus.filter(menu => menu.status === true);
        this.menus = activeMenus;
      })
  }

  loadStocks() {
    this.stockService
      .getStocks()
      .subscribe(stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
      })
  }

  loadProducts() {
    this.productService
      .getProducts()
      .subscribe(products => {
        this.products = products;
      })
  }

  onSubmitBill() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addBill();
    }
  }

  async onAmountTenderedChange() {
    if (this.saleBill.amount_tendered < 0) {
      window.alert("Enter valid amount!");
      return;
    }

    if (this.saleBill.grand_total) {
      await this.uiService.wait(300);
      if (this.saleBill.amount_tendered < this.saleBill.grand_total) {
        this.amountChange = 0;
      } else {
        this.amountChange = this.saleBill.amount_tendered - this.saleBill.grand_total
        this.saleBill.status = true;
      }
    }
  }

  /* ADD BILLS AND ITEMS */
  // Add Bills
  addBill() {
    if (!this.saleBill.customer_name) {
      window.alert("Enter customer name");
      return;
    } else if (!this.saleBill.remarks) {
      window.alert("Enter remarks");
      return;
    }
    
    const newBill = {
      ...this.saleBill,
      customer_name: this.saleBill.customer_name.toUpperCase(),
      remarks: this.saleBill.remarks.toUpperCase(),
    }

    this.salesService.addSaleBill(newBill)
      .subscribe(async (bill) => {
        this.activeBills.push(bill);
        const lastBillId = this.activeBills.length - 1;
        this.saleItems.map(item => {
          if (!item.billno) {
            item.billno = this.activeBills[lastBillId].id;
          }
          this.salesService.editSaleItem(item).subscribe(item => {
            const index = this.saleItems.findIndex(i => i.id === item.id);
            this.saleItems[index] = item;
            this.loadItems();
          })
        })
        this.resetBillForm();
        await this.uiService.wait(100);
        window.alert("New transaction has been added successfully!");
      });
  }

  // Add Items
  addItem() {
    if (!this.saleItem.menu) {
      window.alert("Select a product!");
      return;
    } else if (!this.saleItem.quantity || this.saleItem.quantity <= 0) {
      window.alert("Enter quantity!");
      return;
    }
    
    this.saleItem.billno = this.saleBill.id;
    this.saleItem.price = this.getMenuDetails(Number(this.saleItem.menu)).price;
    this.saleItem.sub_total = this.saleItem.quantity * this.saleItem.price;

    const newSaleItem = {
      ...this.saleItem,
    }

    this.salesService.addSaleItem(newSaleItem)
      .subscribe(async (saleItem) => {
        this.saleItems.push(saleItem);
        this.loadItems();
        this.resetItemForm();
        await this.uiService.wait(100);
      });
  }

  // UPDATE SALE BILL
  updateSaleBill(saleBill: SaleBill) {
    this.proceedEditBill = true;

    saleBill.customer_name.toUpperCase();
    saleBill.remarks.toUpperCase();

    this.saleBill = saleBill;

    this.toggleBillForm();
  }

  onSaveUpdate() {
    const editingSaleBill = {
      ...this.saleBill,
      customer_name: this.saleBill.customer_name.toUpperCase(),
      remarks: this.saleBill.remarks.toUpperCase(),
    }

    this.salesService
      .editSaleBill(editingSaleBill)
      .subscribe(async (saleBillData) => {
        const index = this.activeBills.findIndex(saleBill => saleBill.id === saleBillData.id);
        this.activeBills[index] = saleBillData;
        this.toggleBillForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the customer details.");
      });
  }
  
  // DELETE BILL
  deleteSaleBill(saleBill: SaleBill) {
    this.deletingSaleBill = saleBill;
    this.toggleBillActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingSaleBill) {
      return;
    }

    this.salesService
      .deleteSaleBill(this.deletingSaleBill)
      .subscribe(async () => {
        this.activeBills = this.activeBills.filter(s => s.id !== this.deletingSaleBill?.id);
        this.deletingSaleBill = null;
        this.toggleBillActionModal()
        await this.uiService.wait(100);
        window.alert("Transaction has been deleted successfully!");
      });
  }

  getMenuDetails(menuId: any): {name: string, code?: string, price: number} {
    const foundMenu = this.menus.find(menu => menu.id === menuId);
    if (foundMenu) {
      return {
        name: foundMenu.name,
        code: foundMenu.code,
        price: foundMenu.price,
      }
    } else {
      return {
        name: "Product not found!",
        code: "Product not found!",
        price: 0,
      }
    }
  }

  onSubmitItem() {
    if (this.proceedEditItem) {
      this.saveItemUpdate();
    } else {
      this.addItem();
    }
  }

  onMenuSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewProduct') {
      this.router.navigate(['products/']);
    }
  }

  // UPDATE SALE ITEM
  updateSaleItem(saleItem: SaleItem) {
    this.proceedEditItem = true;
    this.saleItem = {...saleItem};
  }

  saveItemUpdate() {
    this.saleItem.sub_total = this.saleItem.quantity * this.getMenuDetails(this.saleItem.menu).price;

    const editingSaleItem = {
      ...this.saleItem
    }

    this.salesService
      .editSaleItem(editingSaleItem)
      .subscribe(async (saleItemData) => {
        const index = this.saleItems.findIndex(saleItem => saleItem.id === saleItemData.id);

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the item.");

        this.saleItems[index] = saleItemData;
      });
  }

  // DELETE SALE ITEM
  deleteSaleItem(saleItem: SaleItem) {
    this.deletingSaleItem = saleItem;
    this.toggleItemActionModal();
  }

  onConfirmDeleteItem() {
    if (!this.deletingSaleItem) {
      return;
    }

    this.salesService
      .deleteSaleItem(this.deletingSaleItem)
      .subscribe(async () => {
        this.activeBills = this.activeBills.filter(s => s.id !== this.deletingSaleItem?.id);
        this.deletingSaleItem = null;
        this.toggleItemActionModal()
        this.loadItems();
        await this.uiService.wait(100);
        window.alert("Item has been deleted successfully!");
      });
  }

  onBillOut() {
    this.toggleInvoice();
    if (this.showInvoice) {
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this.renderer.setStyle(document.body, 'overflow', 'auto');
    }

    this.salesService.editSaleBill(this.saleBill)
      .subscribe(data => {
        const index = this.activeBills.findIndex(saleBill => saleBill.id === data.id);
        this.activeBills[index] = data;
        this.loadBills();
      });
  }

  onPayment() {
    if (this.saleBill.grand_total) {
      if (this.saleBill.amount_tendered < this.saleBill.grand_total) {
        window.alert("Invalid amount tendered!");
        return;
      }
    }

    this.salesService.editSaleBill(this.saleBill).subscribe((bill) => {
      if (bill.grand_total) {
        this.toggleInvoice();
        this.toggleProceedPayment();
      } else {
        window.alert("No payable amount!");
        return;
      }
    });
  }
}