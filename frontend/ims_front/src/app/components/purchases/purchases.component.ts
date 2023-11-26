import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';
import { Supplier } from 'src/app/interface/Supplier';
import { Stock } from 'src/app/interface/Stock';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { PurchasesService } from 'src/app/services/purchases/purchases.service';
import { StocksService } from 'src/app/services/stocks/stocks';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {
  deletingBill?: PurchaseBill | null = null;
  deletingItem?: PurchaseItem | null = null;

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

  activeBills: PurchaseBill[] = [];
  allBills: PurchaseBill[] = [];
  items: PurchaseItem[] = [];
  suppliers: Supplier[] = [];
  stocks: Stock[] = [];
  amountChange: number = 0;

  bill: PurchaseBill = {
    id: undefined,
    billno: "",
    time: undefined,
    supplier_id: undefined,
    grand_total: undefined,
  };

  item: PurchaseItem = {
    id: undefined,
    stock_id: undefined,
    purchaseBill_id: undefined,
    purchase_date: "",
    quantity_purchased: 0,
    item_price: 0,
    sub_total: undefined,
  }

  constructor(
      private purchaseService: PurchasesService,
      private supplierService: SuppliersService,
      private stockService: StocksService,
      private uiService: UiService,
      private router: Router,
      private renderer: Renderer2,
    ) {}

  resetBillForm() {
    this.proceedEditBill = false;
    this.bill = {
      id: undefined,
      billno: "",
      time: undefined,
      supplier_id: undefined,
      grand_total: undefined,
    };
  }
  
  resetItemForm() {
    this.item = {
      id: undefined,
      stock_id: undefined,
      purchaseBill_id: undefined,
      purchase_date: "",
      quantity_purchased: 0,
      item_price: 0,
      sub_total: undefined,
    }
  }

  toggleProceedPayment() {
    this.proceedPayment = !this.proceedPayment;
    if (!this.proceedPayment) {
      // this.bill.amount_tendered = 0;
    }
  } 

  async toggleInvoice() {
    this.showInvoice = !this.showInvoice;
    if (!this.showInvoice) {
      await this.uiService.wait(100);
      window.alert('Transaction has been completed successfully!')
      this.loadBills();
      this.viewOrder(this.bill);
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

  viewOrder(bill: PurchaseBill) {
    this.bill = bill;
    this.loadItems();
    this.toggleBillTable();

    this.updatingOrder = !this.updatingOrder;
    if (!this.updatingOrder) {
      this.resetBillForm();
      this.loadItems();
    }
  }

  calculateGrandtotal(items: PurchaseItem[]): number {
    let grandTotal = 0;
    items.forEach(item => {
      grandTotal += item.sub_total || 0;
    });

    return grandTotal;
  }

  increaseQtyInput(): void {
    this.item.quantity_purchased ++;
  }

  decreaseQtyInput(): void {
    if (this.item.quantity_purchased < 1) {
      return;
    }
    this.item.quantity_purchased --;
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadBills();
    this.loadItems();
    this.loadSuppliers();
    this.loadStocks();
  }  

  loadBills() {
    this.purchaseService
      .getPurchaseBills()
      .subscribe(salesBills => {
        // this.activeBills = salesBills.filter(item => !item.status);
        this.allBills = salesBills;
      });
  }

  loadItems() {
    this.purchaseService
      .getPurchaseItems()
      .subscribe((items) => {
        if (this.updatingOrder) {
          this.items = items.filter(item => item.purchaseBill_id === this.bill.id);
          this.bill.grand_total = this.calculateGrandtotal(this.items);
        } else {
          this.items = items.filter(item => item.purchaseBill_id === null);
          this.bill.grand_total = this.calculateGrandtotal(this.items);
        }
      });
  }

  loadSuppliers() {
    this.supplierService
      .getSuppliers()
      .subscribe(suppliers => {
        const activeSuppliers = suppliers.filter(supplier => supplier.status === true);
        this.suppliers = activeSuppliers;
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

  onSubmitBill() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addBill();
    }
  }

  // async onAmountTenderedChange() {
  //   if (this.bill.amount_tendered < 0) {
  //     window.alert("Enter valid amount!");
  //     return;
  //   }

  //   if (this.bill.grand_total) {
  //     await this.uiService.wait(300);
  //     if (this.bill.amount_tendered < this.bill.grand_total) {
  //       this.amountChange = 0;
  //     } else {
  //       this.amountChange = this.bill.amount_tendered - this.bill.grand_total
  //       this.bill.status = true;
  //     }
  //   }
  // }

  /* ADD BILLS AND ITEMS */
  
  // Add Bills
  addBill() {
    if (!this.bill.billno) {
      window.alert("Enter bill no!");
      return;
    } else if (!this.bill.supplier_id) {
      window.alert("Enter supplier id!");
      return;
    }
    
    const newBill = {
      ...this.bill,
      customer_name: this.bill.billno.toUpperCase(),
    }

    this.purchaseService.addPurchaseBill(newBill)
      .subscribe(async (bill) => {
        this.activeBills.push(bill);
        const lastBillId = this.activeBills.length - 1;
        this.items.map(item => {
          if (!item.purchaseBill_id) {
            item.purchaseBill_id = this.activeBills[lastBillId].id;
          }
          this.purchaseService.editPurchaseItem(item).subscribe(item => {
            const index = this.items.findIndex(i => i.id === item.id);
            this.items[index] = item;
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
    if (!this.item.stock_id) {
      window.alert("Select a product!");
      return;
    } else if (!this.item.quantity_purchased || this.item.quantity_purchased <= 0) {
      window.alert("Enter quantity!");
      return;
    }
    
    this.item.purchaseBill_id = this.bill.id;
    this.item.sub_total = this.item.quantity_purchased * this.item.item_price;

    const newSaleItem = {
      ...this.item,
    }

    this.purchaseService.addPurchaseItem(newSaleItem)
      .subscribe(async (item) => {
        this.items.push(item);
        this.loadItems();
        this.resetItemForm();
        await this.uiService.wait(100);
      });
  }

  // UPDATE SALE BILL
  updateSaleBill(bill: PurchaseBill) {
    this.proceedEditBill = true;

    bill.billno.toUpperCase();

    this.bill = bill;

    this.toggleBillForm();
  }

  onSaveUpdate() {
    this.bill.billno.toUpperCase();
    
    const editingPurchaseBill = {
      ...this.bill,
    }

    this.purchaseService
      .editPurchaseBill(editingPurchaseBill)
      .subscribe(async (billData) => {
        const index = this.activeBills.findIndex(bill => bill.id === billData.id);
        this.activeBills[index] = billData;
        this.toggleBillForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the bill details.");
      });
  }
  
  // DELETE BILL
  deleteBill(bill: PurchaseBill) {
    if (this.activeBills.length <= 1) {
      window.alert("Please add new transaction before deleting this one! Consider editing this instead of deletion.");
      return;
    }
    else {
      this.deletingBill = bill;
      this.toggleBillActionModal();
    }
  }

  onConfirmDelete() {
    if (!this.deletingBill) {
      return;
    }

    this.purchaseService
      .deletePurchaseBill(this.deletingBill)
      .subscribe(async () => {
        this.activeBills = this.activeBills.filter(s => s.id !== this.deletingBill?.id);
        this.deletingBill = null;
        this.toggleBillActionModal()
        await this.uiService.wait(100);
        window.alert("Transaction has been deleted successfully!");
      });
  }

  getSupplierDetails(supplierId: any): {supplierName: string, supplierCode?: string} {
    const foundSupplier = this.suppliers.find(supplier => supplier.id === supplierId);
    if (foundSupplier) {
      return {
        supplierName: foundSupplier.name,
        supplierCode: foundSupplier.code,
      }
    } else {
      return {
        supplierName: "Product not found!",
        supplierCode: "Product not found!",
      }
    }
  }

  getStockDetails(stockId: any): {stockName: string, stockCode?: string} {
    const foundStock = this.stocks.find(stock => stock.id === stockId);
    if (foundStock) {
      return {
        stockName: foundStock.stock_name,
        stockCode: foundStock.code,
      }
    } else {
      return {
        stockName: "Stock not found!",
        stockCode: "Stock not found!",
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

  onStockSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewStock') {
      this.router.navigate(['stocks/']);
    }
  }

  // UPDATE SALE ITEM
  updateSaleItem(item: PurchaseItem) {
    this.proceedEditItem = true;
    this.item = {...item};
  }

  saveItemUpdate() {
    this.item.sub_total = this.item.quantity_purchased * this.item.item_price;

    const editingSaleItem = {
      ...this.item
    }

    this.purchaseService
      .editPurchaseItem(editingSaleItem)
      .subscribe(async (itemData) => {
        const index = this.items.findIndex(saleItem => saleItem.id === itemData.id);

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the item.");

        this.items[index] = itemData;
      });
  }

  // DELETE SALE ITEM
  deleteItem(item: PurchaseItem) {
    this.deletingItem = item;
    this.toggleItemActionModal();
  }

  onConfirmDeleteItem() {
    if (!this.deletingItem) {
      return;
    }

    this.purchaseService
      .deletePurchaseItem(this.deletingItem)
      .subscribe(async () => {
        this.activeBills = this.activeBills.filter(s => s.id !== this.deletingItem?.id);
        this.deletingItem = null;
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

    this.purchaseService.editPurchaseBill(this.bill)
      .subscribe(data => {
        const index = this.activeBills.findIndex(bill => bill.id === data.id);
        this.activeBills[index] = data;
        this.loadBills();
      });
  }

  onPayment() {
    // if (this.bill.grand_total) {
    //   if (this.bill.amount_tendered < this.bill.grand_total) {
    //     window.alert("Invalid amount tendered!");
    //     return;
    //   }
    // }

    this.purchaseService.editPurchaseBill(this.bill).subscribe((bill) => {
      if (bill.grand_total) {
        this.toggleInvoice();
        this.toggleProceedPayment();
      }
    });
  }
}