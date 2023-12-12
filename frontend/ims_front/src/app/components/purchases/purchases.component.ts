import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';
import { Supplier } from 'src/app/interface/Supplier';
import { Stock } from 'src/app/interface/Stock';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faRectangleList, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { PurchasesService } from 'src/app/services/purchases/purchases.service';
import { StocksService } from 'src/app/services/stocks/stocks.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.css']
})
export class PurchasesComponent implements OnInit {
  deletingBill?: PurchaseBill | null = null;
  deletingItem?: PurchaseItem | null = null;

  isFetching: boolean = false;
  isLoading: boolean = false;

  proceedEditBill: boolean = false;
  proceedEditItem: boolean = false;
  proceedPayment: boolean = false;

  showFormContainer: boolean = false; 
  showBillForm: boolean = false;
  showBillTable: boolean = true;  
  showPurchaseBill: boolean = false;

  showSaveBillModal: boolean = false;
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

  bills: PurchaseBill[] = [];
  items: PurchaseItem[] = [];
  allItems: PurchaseItem[] = [];
  suppliers: Supplier[] = [];
  stocks: Stock[] = [];

  bill: PurchaseBill = {
    id: undefined,
    billno: "",
    time: undefined,
    supplier_id: undefined,
    grand_total: 0,
    remarks: "",
  };

  originalBill: PurchaseBill = {
    id: undefined,
    billno: "",
    time: undefined,
    supplier_id: undefined,
    grand_total: 0,
    remarks: "",
  };

  item: PurchaseItem = {
    id: undefined,
    stock_id: undefined,
    purchaseBill_id: undefined,
    purchase_date: "",
    quantity_purchased: 0,
    item_price: 0,
    sub_total: 0,
  }

  constructor(
    private purchaseService: PurchasesService,
    private supplierService: SuppliersService,
    private stockService: StocksService,
    private uiService: UiService,
    private router: Router,
    private renderer: Renderer2,
    private toastrService: ToastrService,
  ) {}

  resetBillForm() {
    this.proceedEditBill = false;
    this.bill = {
      id: undefined,
      billno: "",
      time: undefined,
      supplier_id: undefined,
      grand_total: 0,
      remarks: "",
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
      sub_total: 0,
    }
  }

  toggleSaveBillModal() {
    this.showSaveBillModal = !this.showSaveBillModal;
    if (this.showSaveBillModal) {
      if (!this.bill.billno) {
        this.toastrService.error("Failed: Please enter bill no.");
        this.showSaveBillModal = false;
        return;
      } else if (!this.bill.supplier_id) {
        this.toastrService.error("Failed: Please enter supplier.");
        this.showSaveBillModal = false;
        return;
      } else if (this.items.length < 1) {
        this.toastrService.error("Failed: Please add at least one item to the purchase.");
        this.showSaveBillModal = false;
        return;
      }
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
      this.loadFilteredItems();
    }
  }

  toggleFormContainer() {
    this.showFormContainer = !this.showFormContainer;
    this.toggleBillTable();
  }

  viewOrder(bill: PurchaseBill) {
    this.bill = bill;
    this.loadFilteredItems();
    this.toggleFormContainer();

    this.showPurchaseBill = !this.showPurchaseBill;
    if (!this.showPurchaseBill) {
      this.resetBillForm();
      this.loadFilteredItems();
    }
  }

  @HostListener('document:keyup.escape', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showItemActionModal) {
        this.toggleItemActionModal();
      } else if (this.showBillActionModal) {
        this.toggleBillActionModal();
      } else if (this.showBillForm) {
        this.toggleBillForm();
      } else if (this.showSaveBillModal) {
        this.toggleSaveBillModal();
      }
    }
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

  calculateGrandtotal(items: PurchaseItem[]): number {
    let grandTotal = 0;
    items.forEach(item => {
      grandTotal += item.item_price * item.quantity_purchased || 0;
    });

    return grandTotal;
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.loadSuppliers();
    this.loadFilteredItems();
    this.loadAllItems();
    this.loadStocks();
    this.loadBills();
  }  

  loadBills() {
    this.isFetching = true;
    this.purchaseService
      .getPurchaseBills()
      .subscribe({
        next: bills => {
          this.isFetching = false;
          this.bills = bills
        },
        error: error => {
          this.isFetching = false;
          this.uiService.displayErrorMessage(error)
        },
      });
  }

  loadFilteredItems() {
    this.isFetching = true;
    this.purchaseService
      .getPurchaseItems()
      .subscribe({
        next: (items) => {
          if (this.showPurchaseBill) {
            this.isFetching = false;
            this.items = items.filter(item => item.purchaseBill_id === this.bill.id);
          } else {
            this.isFetching = false;
            this.items = items.filter(item => item.purchaseBill_id === null);
            this.bill.grand_total = this.calculateGrandtotal(this.items);
          }
        },
        error: (err) => console.log(err),
      });
  }

  loadAllItems() {
    this.purchaseService
      .getPurchaseItems()
      .subscribe({
        next: items => this.allItems = items,
        error: err => console.log(err),
      });
  }

  loadSuppliers() {
    this.supplierService
      .getSuppliers()
      .subscribe({
        next: suppliers => {
          const activeSuppliers = suppliers.filter(supplier => supplier.status === true);
          this.suppliers = activeSuppliers;
        },
        error: err => console.log(err)
      })
  }

  loadStocks() {
    this.stockService
      .getStocks()
      .subscribe({
        next: stocks => {
          this.stocks = stocks;
        },
        error: err => console.log(err)
      })
  }

  getItemLength(bill: PurchaseBill) {
    const items = this.allItems.filter(item => item.purchaseBill_id === bill.id);
    return items.length;
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
        supplierName: "Supplier not found!",
        supplierCode: "Supplier not found!",
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

  onSubmitBill() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addBill();
    }
  }

  /* ADD BILLS AND ITEMS */
  // Add Bills
  addBill() {
    const newBill = {
      ...this.bill,
      billno: this.bill.billno.toUpperCase(),
    }

    const items = Array.from(this.items);
    const stocks = Array.from(this.stocks);

    const accumulatedItems = items.reduce((acc: PurchaseItem[], obj: PurchaseItem) => {
      const existingObj = acc.find(item => item.stock_id === obj.stock_id);
      if (existingObj) {
        existingObj.quantity_purchased += obj.quantity_purchased;
      } else {
        acc.push({ ...obj })
      }
      return acc;
    }, []);

    // Stocks to be adjusted.
    stocks.forEach(stock => {
      const foundStock = accumulatedItems.find(item => item.stock_id === stock.id);
      if (foundStock) {
        stock.quantity += foundStock.quantity_purchased;
      }
    })

    const isBillnoExist = this.bills.some(bill => bill.billno === newBill.billno);
    if (isBillnoExist) {
      this.toastrService.error("Billno with this name already exists!");
    } else {
      this.isLoading = true;
      this.purchaseService.addPurchaseBill(newBill)
      .subscribe({
        next: async (bill) => {
          this.isLoading = false;
          this.bills.push(bill);
          this.items.map(item => {
            if (!item.purchaseBill_id) {
              item.purchaseBill_id = bill.id;
            }
            this.purchaseService.editPurchaseItem(item).subscribe(item => {
              const index = this.items.findIndex(i => i.id === item.id);
              this.items[index] = item;
              this.loadBills();
              this.loadAllItems();
              this.loadFilteredItems();
            });
          })
  
          // Adjusted inventories upon saving the purchase.
          stocks.map(stock => {
            this.stockService.editStock(stock)
            .subscribe();
          });
  
          this.resetBillForm();
          this.toggleSaveBillModal();
          this.toggleFormContainer();
  
          await this.uiService.wait(100);
          if (!bill.grand_total || bill.grand_total < 1) {
            this.toastrService.warning(
              "You have saved a purchase without a total amount. Make sure it is correct.",
              "Zero Total Amount!",
              {timeOut: 5000}
            );
          }
          this.toastrService.success("Success: New purchase has been added.");
        },

        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        },
      });
    }
  }

  // Add Items
  addItem() {
    if (!this.item.stock_id) {
      this.toastrService.error("Select a product!");
      return;
    } else if (!this.item.quantity_purchased || this.item.quantity_purchased <= 0) {
      this.toastrService.error("Enter quantity!");
      return;
    }
    
    this.item.purchaseBill_id = this.bill.id;
    this.item.sub_total = this.item.quantity_purchased * this.item.item_price;

    const newSaleItem = {
      ...this.item,
    }

    this.isLoading = true;
    this.purchaseService.addPurchaseItem(newSaleItem)
      .subscribe({
        next: async (item) => {
          this.isLoading = false
          this.items.push(item);
          this.loadFilteredItems();
          this.resetItemForm();

          // Update total bill upon adding an item
          if (this.showPurchaseBill) {
            this.bill.grand_total += item.sub_total;
          }
      
          this.purchaseService.editPurchaseBill(this.bill)
          .subscribe({
            next: bill => {
              this.bill = bill;
              this.loadBills();
            },
            error: err => console.log(err) 
          });
  
          await this.uiService.wait(100);
          if (!item || item.item_price < 1) {
            this.toastrService.warning(
              "You have added an item without a price. Make sure it is correct.",
              "Zero Price!",
              {timeOut: 5000}
            );
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err)
        },
      });
  }

  // UPDATE BILLS AND ITEMS
  // Update Bill
  updateBill(bill: PurchaseBill) {
    this.proceedEditBill = true;

    bill.billno.toUpperCase();

    this.bill = { ...bill };
    this.originalBill = { ...bill };

    this.toggleBillForm();
  }

  onSaveUpdate() {
    if (JSON.stringify(this.originalBill) === JSON.stringify(this.bill)) {
      this.toggleBillForm();
      return;
    }

    this.bill.billno.toUpperCase();
    
    const editingPurchaseBill = {
      ...this.bill,
      billno: this.bill.billno.toUpperCase(),
    }

    const isBillNoExist = this.bills.some(bill => bill.id !== editingPurchaseBill.id && bill.billno === editingPurchaseBill.billno);

    if (isBillNoExist) {
      this.toastrService.error("Purchase with this billno already exists!");
      return;
    } else {
      this.isLoading = true;
      this.purchaseService
      .editPurchaseBill(editingPurchaseBill)
      .subscribe({
        next: async (billData) => {
          this.isLoading = false;
          const index = this.bills.findIndex(bill => bill.id === billData.id);
          this.bills[index] = billData;
          this.toggleBillForm();
  
          await this.uiService.wait(100);
          this.toastrService.success("Successfully saved changes to the bill details.");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err)
        },
      });
    }
  }

  // Update Item
  updateItem(item: PurchaseItem) {
    this.proceedEditItem = true;
    this.item = {...item};
  }

  saveItemUpdate() {
    this.item.sub_total = this.item.quantity_purchased * this.item.item_price;

    const editingSaleItem = {
      ...this.item
    }

    this.isLoading = true;
    this.purchaseService
      .editPurchaseItem(editingSaleItem)
      .subscribe({
        next: async (itemData) => {
          this.isLoading = false;
          const index = this.items.findIndex(saleItem => saleItem.id === itemData.id);
  
          await this.uiService.wait(100);
          this.toastrService.success("Successfully saved changes to the item.");
  
          this.items[index] = itemData;
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err)
        },
      });
  }
  
  // UPDATE BILLS AND ITEMS
  // Delete bill
  deleteBill(bill: PurchaseBill) {
    this.deletingBill = bill;
    this.toggleBillActionModal();
  }

  onConfirmDeleteBill() {
    if (!this.deletingBill) {
      return;
    }

    this.isLoading = true;
    this.purchaseService
      .deletePurchaseBill(this.deletingBill)
      .subscribe({
        next: async () => {
          this.isLoading = false;
          this.bills = this.bills.filter(s => s.id !== this.deletingBill?.id);
          this.deletingBill = null;
          this.toggleBillActionModal()
          await this.uiService.wait(100);
          this.toastrService.success("Transaction has been deleted successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        },
      });
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
    if (target.value === 'addNewItem') {
      this.router.navigate(['stocks/']);
    }
  }

  onSupplierSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewSupplier') {
      this.router.navigate(['suppliers/']);
    }
  }

  // Delete Item
  deleteItem(item: PurchaseItem) {
    this.deletingItem = item;
    this.toggleItemActionModal();
  }

  onConfirmDeleteItem() {
    if (!this.deletingItem) {
      return;
    }

    // Reduce bill total upon deleting an item
    this.bill.grand_total -= this.deletingItem.sub_total;

    this.purchaseService.editPurchaseBill(this.bill)
    .subscribe({
      next: data => {
        this.bill = data;
      },
      error: (err) => {
        console.log(err);
      }
    });

    this.isLoading = true;
    this.purchaseService
      .deletePurchaseItem(this.deletingItem)
      .subscribe({
        next: async () => {
          this.isLoading = false;
          this.bills = this.bills.filter(s => s.id !== this.deletingItem?.id);
          this.deletingItem = null;
          this.toggleItemActionModal()
          this.loadFilteredItems();
          await this.uiService.wait(100);
          this.toastrService.error("Item has been deleted successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }
}
