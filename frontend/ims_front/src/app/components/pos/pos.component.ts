import { Component, OnInit } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Product } from 'src/app/interface/Product';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark, faEye, faPlusMinus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';
import { DecimalPipe } from '@angular/common';

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
  showItemForm: boolean = false;
  showItemTable: boolean = false;

  showBillActionModal: boolean = false;
  showItemActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;
  faEye = faEye;
  faPlusMinus = faPlusMinus;
  faTimes = faTimes;

  saleBills: SaleBill[] = [];
  saleItems: SaleItem[] = [];
  products: Product[] = [];

  saleBill: SaleBill = {
    id: undefined,
    billno: "",
    time: "",
    customer_name: "",
    remarks: "",
    grand_total: 0,
  };

  saleItem: SaleItem = {
    id: undefined,
    billno: "",
    product_id: undefined,
    quantity_sold:  0,
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

  toggleBillForm() {
    this.showBillForm = !this.showBillForm;
    if (!this.showBillForm) {
      this.resetBillForm();
    }
  }

  toggleActionModal() {
    this.showBillActionModal = !this.showBillActionModal;
  }

  toggleItemTable(saleBill: SaleBill) {
    this.showItemTable = !this.showItemTable;
    this.saleBill = saleBill;

    this.salesService
    .getSaleItems()
    .subscribe((saleItems) => {
      this.saleItems = saleItems.filter(item => item.billno === saleBill.id);
    });
  }

  calculateGrandtotal(): number {
    let grandTotal = 0;

    this.saleItems.forEach(item => {
      grandTotal += item.sub_total || 0
    });

    return grandTotal;
  }

  // SHOW BILLS
  ngOnInit(): void {
    this.salesService
      .getSaleBills()
      .subscribe(salesBill => this.saleBills = salesBill);

    this.productService
      .getProducts()
      .subscribe(products => {
        const activeProducts = products.filter(product => product.status === true);
        this.products = activeProducts;
      })
  }  

  onSubmit() {
    if (this.proceedEditBill) {
      this.onSaveUpdate();
    } else {
      this.addSaleBill();
    }
  }

  // CREATE PRODUCT
  addSaleBill() {
    if (!this.saleBill.customer_name) {
      window.alert("Enter customer name");
      return;
    } else if (!this.saleBill.remarks) {
      window.alert("Enter remarks");
      return;
    }

    const lastItem = this.saleBills[this.saleBills.length - 1];
    let lastItemNumber;

    if (lastItem) {
      lastItemNumber = Number(lastItem.billno.split('-')[2]);
    } else {
      lastItemNumber = 0;
    }

    this.saleBill.billno = this.uiService.generateSequentialCode('SBI', lastItemNumber);
    this.saleBill.grand_total = this.calculateGrandtotal();
    
    const newSaleBill = {
      ...this.saleBill,
      customer_name: this.saleBill.customer_name.toUpperCase(),
      remarks: this.saleBill.remarks.toUpperCase(),
    }

    this.salesService.addSaleBill(newSaleBill)
      .subscribe(async (saleBill) => {
        this.saleBills.push(saleBill);
        this.toggleBillForm();
        await this.uiService.wait(100);
        window.alert("New saleBill has been created successfully!");
      });
  }

  // UPDATE SALE BILL
  updateSaleBill(saleBill: SaleBill) {
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
        const index = this.saleBills.findIndex(saleBill => saleBill.id === saleBillData.id);

        this.toggleBillForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the bill.");

        this.saleBills[index] = saleBillData;
      });
  }
  
  // DELETE BILL
  deleteSaleBill(saleBill: SaleBill) {
    if (this.saleBills.length <= 1) {
      window.alert("Please create a new bill before deleting this one! Consider editing this bill instead of deletion.");
      return;
    }
    else {
      this.deletingSaleBill = saleBill;
      this.toggleActionModal();
    }
  }

  onConfirmDelete() {
    if (!this.deletingSaleBill) {
      return;
    }

    this.salesService
      .deleteSaleBill(this.deletingSaleBill)
      .subscribe(async () => {
        this.saleBills = this.saleBills.filter(s => s.id !== this.deletingSaleBill?.id);
        this.deletingSaleBill = null;
        this.toggleActionModal()
        await this.uiService.wait(100);
        window.alert("SaleBill has been deleted successfully!");
      });
  }

  resetItemForm() {
    this.proceedEditItem = false;
    this.saleItem.billno = "";
    this.saleItem.product_id = undefined;
    this.saleItem.quantity_sold = 0;
    this.saleItem.sale_date = "";
    this.saleItem.sub_total = 0;
  }

  toggleItemForm() {
    this.showItemForm = !this.showItemForm;
    if (!this.showItemForm) {
      this.resetItemForm();
    }
  }

  toggleItemActionModal() {
    this.showItemActionModal = !this.showItemActionModal;
  }

  // SHOW ITEMS
  getSaleBill(saleBillId: any): string {
    const foundSaleBill = this.saleBills.find(saleBill => saleBill.id === saleBillId);
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

  // ADD SALE ITEM
  addSaleItem() {
    if (!this.saleItem.product_id) {
      window.alert("Enter customer name");
      return;
    } else if (!this.saleItem.quantity_sold || this.saleItem.quantity_sold < 0) {
      window.alert("Enter quantity");
      return;
    }
    
    this.saleItem.sub_total = this.saleItem.quantity_sold * this.getProductDetails(this.saleItem.product_id).productPrice; 

    const newSaleItem = {
      ...this.saleItem,
    }

    this.salesService.addSaleItem(newSaleItem)
      .subscribe(async (saleItem) => {
        this.saleItems.push(saleItem);
        this.toggleItemForm();
        await this.uiService.wait(100);
        window.alert("New saleBill has been created successfully!");
      });
  }

  onProductSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewProduct') {
      this.toggleItemForm();
      this.router.navigate(['products/']);
    }
  }

  // UPDATE SALE ITEM
  updateSaleItem(saleItem: SaleItem) {
    console.log(saleItem.billno);
    console.log(this.getProductDetails(saleItem.product_id).productPrice);
    this.proceedEditItem = true;
    this.saleItem = {...saleItem};

    this.toggleItemForm();
  }

  saveItemUpdate() {
    this.saleItem.sub_total = this.saleItem.quantity_sold * this.getProductDetails(this.saleItem.product_id).productPrice;
    this.saleBill.grand_total = this.calculateGrandtotal();

    const editingSaleItem = {
      ...this.saleItem
    }

    this.salesService
      .editSaleItem(editingSaleItem)
      .subscribe(async (saleItemData) => {
        const index = this.saleItems.findIndex(saleItem => saleItem.id === saleItemData.id);

        this.toggleItemForm();

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
        this.saleBills = this.saleBills.filter(s => s.id !== this.deletingSaleItem?.id);
        this.deletingSaleItem = null;
        this.toggleItemActionModal()
        await this.uiService.wait(100);
        window.alert("SaleBill has been deleted successfully!");
      });
  }
}