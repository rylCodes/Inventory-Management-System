import { Component, OnInit } from '@angular/core';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';
import { Stock } from 'src/app/interface/Stock';
import { StocksService } from 'src/app/services/stocks/stocks';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faEye, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { PurchasesService } from 'src/app/services/purchases/purchases.service';
import { SaleItem } from 'src/app/interface/Sale';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';
import { Supplier } from 'src/app/interface/Supplier';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {
  // SALE BILL
  deletingPurchaseBill?: PurchaseBill | null = null;
  deletingPurchaseItem?: PurchaseItem | null = null;

  proceedEditBill: boolean = false;
  proceedEditItem: boolean = false;

  showBillForm: boolean = false;
  showBillTable: boolean = true;  
  showItemTable: boolean = false;

  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faEye = faEye;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;

  bills: PurchaseBill[] = [];
  items: PurchaseItem[] = [];
  stocks: Stock[] = [];
  suppliers: Supplier[] = [];

  bill: PurchaseBill = {
    id: undefined,
    billno: "",
    time: "",
    supplier_id: 0,
    grand_total: 0,
  };

  item: PurchaseItem = {
    id: undefined,
    purchaseBill_id: undefined,
    purchase_date: "",
    quantity_purchased: 0,
    item_price: 0,
    sub_total: 0,
  }

  constructor(
      private purchasesService: PurchasesService,
      private stocksService: StocksService,
      private uiService: UiService,
      private router: Router,
      private suppliersService: SuppliersService
    ) {}

  resetBillForm() {
    this.proceedEditBill = false;
    this.bill = {
      billno: "",
      supplier_id: undefined,
      grand_total: 0,
    };
  }
  
  resetItemForm() {
    this.proceedEditItem = false;
    this.item.purchaseBill_id = undefined;
    this.item.quantity_purchased = 0;
    this.item.sub_total = 0;
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

  toggleItemTable(bill: PurchaseBill) {
    this.bill = bill;
    this.getCurrentItems(bill);

    this.toggleBillTable();
    this.showItemTable = !this.showItemTable;
    if (!this.showItemTable) {
      this.resetBillForm();
    }

    console.log(this.bill.id);
  }

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
    if (!this.showBillForm) {
      this.resetBillForm();
    }
  }

  calculateGrandtotal(): number {
    let grandTotal = 0;

    this.items.forEach(item => {
      grandTotal += item.sub_total || 0
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
    this.purchasesService
      .getPurchaseBills()
      .subscribe(bill => this.bills = bill);

    this.stocksService
      .getStocks()
      .subscribe(stocks => {
        const activeStocks = stocks.filter(stock => stock.status === true);
        this.stocks = activeStocks;
      })

    this.purchasesService
      .getPurchaseItems()
      .subscribe((items) => this.items = items);

    this.suppliersService
      .getSuppliers()
      .subscribe(suppliers => this.suppliers = suppliers);
  }  

  onSubmit() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addBill();
    }
  }

  // CREATE PRODUCT
  addBill() {
    if (!this.bill.supplier_id) {
      window.alert("Enter supplier");
      return;
    }

    const lastItem = this.bills[this.bills.length - 1];
    let lastItemNumber;

    if (!this.bill.billno) {
      if (lastItem) {
        lastItemNumber = Number(lastItem.billno.split('-')[2]);
        this.bill.billno = this.uiService.generateSequentialCode('SBI', lastItemNumber);
      } else {
        lastItemNumber = 0;
        this.bill.billno = this.uiService.generateSequentialCode('SBI', lastItemNumber);
      }
    }

    this.bill.grand_total = this.calculateGrandtotal();
    
    const newBill = {
      ...this.bill,
    }

    this.purchasesService.addPurchaseBill(newBill)
      .subscribe(async (bill) => {
        this.bills.push(bill);
        this.toggleBillForm();
        await this.uiService.wait(100);
        window.alert("New transaction has been added successfully!");
      });
  }

  // UPDATE SALE BILL
  updateBill(bill: PurchaseBill) {
    this.proceedEditBill = true;
    this.bill = bill;

    this.toggleBillForm();
  }

  onSaveUpdate() {
    const editingPurchaseBill = {
      ...this.bill,
    }

    this.purchasesService
      .editPurchaseBill(editingPurchaseBill)
      .subscribe(async (billData) => {
        const index = this.bills.findIndex(bill => bill.id === billData.id);

        this.toggleBillForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the bill details.");

        this.bills[index] = billData;
      });
  }
  
  // DELETE BILL
  deleteBill(bill: PurchaseBill) {
    if (this.bills.length <= 1) {
      window.alert("Please add new transaction before deleting this one! Consider editing this instead of deletion.");
      return;
    }
    else {
      this.deletingPurchaseBill = bill;
      this.toggleBillActionModal();
    }
  }

  onConfirmDelete() {
    if (!this.deletingPurchaseBill) {
      return;
    }

    this.purchasesService
      .deletePurchaseBill(this.deletingPurchaseBill)
      .subscribe(async () => {
        this.bills = this.bills.filter(s => s.id !== this.deletingPurchaseBill?.id);
        this.deletingPurchaseBill = null;
        this.toggleBillActionModal()
        await this.uiService.wait(100);
        window.alert("Transaction has been deleted successfully!");
      });
  }

  // SHOW ITEMS
  getBill(billId: any): string {
    const foundPurchaseBill = this.bills.find(bill => bill.id === billId);
    return foundPurchaseBill ? foundPurchaseBill.billno : 'Bill Not Found';
  }
  
  getStockDetails(stockId: any): {stockName: string, stockCode: string} {
    const foundProduct = this.stocks.find(stock => stock.id === stockId);
    if (foundProduct) {
      return {
        stockName: foundProduct.stock_name,
        stockCode: foundProduct.code,
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

  getCurrentItems(bill: PurchaseBill) {
    this.purchasesService
      .getPurchaseItems()
      .subscribe((items) => {
        this.items = items.filter(item => item.purchaseBill_id === bill.id);
        this.items.forEach(item => {
          // item.sub_total = item.quantity_purchased * this.getStockDetails(item.stock_id).productPrice;
        })
        this.bill.grand_total = this.calculateGrandtotal();
      });
  }

  // ADD SALE ITEM
  addItem() {
    if (!this.item.stock_id) {
      window.alert("Enter customer name");
      return;
    } else if (!this.item.quantity_purchased || this.item.quantity_purchased < 0) {
      window.alert("Enter quantity");
      return;
    }
    
    // this.item.sub_total = this.item.quantity_purchased * this.getStockDetails(this.item.stock_id).productPrice;
    this.item.purchaseBill_id = this.bill.id;

    const newItem = {
      ...this.item,
    }

    this.purchasesService.addPurchaseItem(newItem)
      .subscribe(async (saleItem) => {
        this.items.push(saleItem);
        this.getCurrentItems(this.bill);
        this.resetItemForm();
        await this.uiService.wait(100);
        window.alert("New customer has been added successfully!");
      });
  }

  onSupplierSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewSupplier') {
      this.router.navigate(['suppliers/']);
    }
  }

  onProductSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewProduct') {
      this.router.navigate(['products/']);
    }
  }

  // UPDATE SALE ITEM
  updateItem(item: PurchaseItem) {
    console.log(item.purchaseBill_id);
    // console.log(this.getStockDetails(item.stock_id).productPrice);
    this.proceedEditItem = true;
    this.item = {...item};
  }

  saveItemUpdate() {
    // this.item.sub_total = this.item.quantity_purchased * this.getStockDetails(this.item.stock_id).productPrice;
    this.bill.grand_total = this.calculateGrandtotal();

    const editingItem = {
      ...this.item
    }

    this.purchasesService
      .editPurchaseItem(editingItem)
      .subscribe(async (itemData) => {
        const index = this.items.findIndex(saleItem => saleItem.id === itemData.id);

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the item.");

        this.items[index] = itemData;
      });
  }

  // DELETE SALE ITEM
  deleteSaleItem(item: PurchaseItem) {
    this.deletingPurchaseItem = item;
    this.toggleItemActionModal();
  }

  onConfirmDeleteItem() {
    if (!this.deletingPurchaseItem) {
      return;
    }

    this.purchasesService
      .deletePurchaseItem(this.deletingPurchaseItem)
      .subscribe(async () => {
        this.bills = this.bills.filter(s => s.id !== this.deletingPurchaseItem?.id);
        this.deletingPurchaseItem = null;
        this.toggleItemActionModal()
        this.getCurrentItems(this.bill);
        await this.uiService.wait(100);
        window.alert("SaleBill has been deleted successfully!");
      });
  }
}