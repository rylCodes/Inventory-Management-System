import { Component, OnInit } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Product } from 'src/app/interface/Product';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faEye, faPlus, faMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.css']
})
export class PosComponent implements OnInit {
  // SALE BILL
  deletingSaleBill?: SaleBill | null = null;
  deletingSaleItem?: SaleItem | null = null;

  proceedEditBill: boolean = false;
  proceedEditItem: boolean = false;

  showBillForm: boolean = false;
  showBillTable: boolean = true;  
  updatingItemTable: boolean = false;

  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faEye = faEye;
  faPlus = faPlus;
  faMinus = faMinus;
  faTimes = faTimes;

  activeBills: SaleBill[] = [];
  allBills: SaleBill[] = [];
  saleItems: SaleItem[] = [];
  products: Product[] = [];

  saleBill: SaleBill = {
    id: undefined,
    billno: "",
    time: "",
    customer_name: "",
    remarks: "",
    grand_total: 0,
    status: false,
  };

  saleItem: SaleItem = {
    id: undefined,
    billno: null,
    product_id: undefined,
    quantity: 0,
    price: 0,
    sale_date: "",
    sub_total: 0,
  }

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private uiService: UiService,
      private router: Router
    ) {}

  resetBillForm() {
    this.proceedEditBill = false;
    this.saleBill = {
      billno: "",
      time: "",
      customer_name: "",
      remarks: "",
    };
  }
  
  resetItemForm() {
    this.proceedEditItem = false;
    this.saleItem.billno = undefined;
    this.saleItem.product_id = undefined;
    this.saleItem.quantity = 0;
    this.saleItem.sale_date = "";
    this.saleItem.sub_total = 0;
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

  viewOrder(saleBill: SaleBill) {
    this.saleBill = saleBill;
    this.loadItems();
    this.toggleBillTable();

    this.updatingItemTable = !this.updatingItemTable;
    if (!this.updatingItemTable) {
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
    this.loadProducts();
  }  

  loadBills() {
    this.salesService
      .getSaleBills()
      .subscribe(salesBills => {
        this.activeBills = salesBills.filter(item => !item.status);
        this.allBills = salesBills;
        console.log(this.allBills.length, this.activeBills.length);
      });
  }

  loadItems() {
    this.salesService
      .getSaleItems()
      .subscribe((saleItems) => {
        if (this.updatingItemTable) {
          this.saleItems = saleItems.filter(item => item.billno === this.saleBill.id);
          this.saleBill.grand_total = this.calculateGrandtotal(this.saleItems);
        } else {
          this.saleItems = saleItems.filter(item => item.billno === null);
          this.saleBill.grand_total = this.calculateGrandtotal(this.saleItems);
        }
      });
  }

  loadProducts() {
    this.productService
      .getProducts()
      .subscribe(products => {
        const activeProducts = products.filter(product => product.status === true);
        this.products = activeProducts;
      })
  }

  async onSubmitBill() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addSaleBill();
    }
  }

  /* ADD BILLS AND ITEMS */
  
  // Add Bills
  addSaleBill() {
    if (!this.saleBill.customer_name) {
      window.alert("Enter customer name");
      return;
    } else if (!this.saleBill.remarks) {
      window.alert("Enter remarks");
      return;
    }

    const lastBill = this.allBills[this.allBills.length - 1];
    let lastBillNumber;

    if (lastBill && lastBill.billno) {
      lastBillNumber = Number(lastBill.billno.split('-')[2]);
      this.saleBill.billno = this.uiService.generateSequentialCode('SBI', lastBillNumber);
    } else {
      lastBillNumber = 0;
      this.saleBill.billno = this.uiService.generateSequentialCode('SBI', lastBillNumber);
    }
    
    const newSaleBill = {
      ...this.saleBill,
      customer_name: this.saleBill.customer_name.toUpperCase(),
      remarks: this.saleBill.remarks.toUpperCase(),
    }

    this.salesService.addSaleBill(newSaleBill)
      .subscribe(async (saleBill) => {
        this.activeBills.push(saleBill);
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
        await this.uiService.wait(100);
        window.alert("New transaction has been added successfully!");
      });
  }

  // Add Items
  addSaleItem() {
    if (!this.saleItem.product_id) {
      window.alert("Select a product!");
      return;
    } else if (!this.saleItem.quantity || this.saleItem.quantity <= 0) {
      window.alert("Enter quantity!");
      return;
    }
    
    this.saleItem.billno = this.saleBill.id;
    this.saleItem.price = this.getProductDetails(Number(this.saleItem.product_id)).productPrice;
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
    this.saleBill.customer_name.toUpperCase();
    this.saleBill.remarks.toUpperCase();
    
    const editingSaleBill = {
      ...this.saleBill,
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
    if (this.activeBills.length <= 1) {
      window.alert("Please add new transaction before deleting this one! Consider editing this instead of deletion.");
      return;
    }
    else {
      this.deletingSaleBill = saleBill;
      this.toggleBillActionModal();
    }
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

  // SHOW ITEMS
  getSaleBill(saleBillId: any): string {
    const foundSaleBill = this.activeBills.find(saleBill => saleBill.id === saleBillId);
    return foundSaleBill ? foundSaleBill.customer_name : 'Bill Not Found';
  }
  
  getProductDetails(productId: any): {productName: string, productCode: string, productPrice: number} {
    const foundProduct = this.products.find(product => product.id === productId);
    if (foundProduct) {
      return {
        productName: foundProduct.product_name,
        productCode: foundProduct.code,
        productPrice: foundProduct.price,
      }
    } else {
      return {
        productName: "Product not found!",
        productCode: "Product not found!",
        productPrice: 0,
      }
    }
  }

  onSubmitItem() {
    if (this.proceedEditItem) {
      this.saveItemUpdate();
    } else {
      this.addSaleItem();
    }
  }

  onProductSelectionChange(event: Event) {
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
    this.saleItem.sub_total = this.saleItem.quantity * this.getProductDetails(this.saleItem.product_id).productPrice;

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

  transactionFunc(): void {
    if (this.updatingItemTable) {
      this.proceedPayment();
    } else {
      this.addSaleBill();
    }
  }

  proceedPayment() {
    this.saleBill.status = true;
    this.salesService.editSaleBill(this.saleBill)
      .subscribe(data => {
        const index = this.activeBills.findIndex(saleBill => saleBill.id === data.id);
        this.activeBills[index] = data;
        this.viewOrder(this.saleBill);
        this.loadBills();
      });
  }
}