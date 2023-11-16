import { Component, OnInit } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Product } from 'src/app/interface/Product';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
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

  proceedEdit: boolean = false;
  showForm: boolean = false;
  showActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  saleBills: SaleBill[] = [];
  products: Product[] = [];

  id?: number;
  billno?: string;
  time?: string;
  customer_name: string = "";
  remarks: string = "";
  grand_total?: number;

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private uiService: UiService,
      private router: Router
    ) {}

  resetForm() {
    this.proceedEdit = false;
    this.billno = "";
    this.time = "";
    this.customer_name = "";
    this.remarks = "";
  }

  toggleForm() {
    const lastItem = this.saleBills[this.saleBills.length - 1];
    console.log(lastItem.id)
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
    this.salesService
      .getSaleBills()
      .subscribe((saleBill) => {
        const sortedSaleBills = saleBill.sort((a, b) => {
          return a.customer_name.localeCompare(b.customer_name)
        })
        this.saleBills = sortedSaleBills;
      });

    this.salesService
      .getSaleBills()
      .subscribe(salesBill => this.saleBills = salesBill);
  }

  getProductName(productId: any): string {
    const foundProduct = this.products.find(product => product.id === productId);
    return foundProduct ? foundProduct.name : 'Stock Not Found';
  }  

  onSubmit() {
    if (this.proceedEdit) {
      this.onSaveUpdate();
    } else {
      this.addSaleBill();
    }
  }

  // CREATE PRODUCT
  addSaleBill() {
    const lastItem = this.saleBills[this.saleBills.length - 1];
    this.billno = this.uiService.generateSequentialCode("SAL", lastItem.id);
    
    const newSaleBill = {
      billno: this.billno,
      customer_name: this.customer_name.toUpperCase(),
      remarks: this.remarks.toUpperCase(),
      grand_total: this.grand_total,
    }

    this.salesService.addSaleBill(newSaleBill)
      .subscribe(async (saleBill) => {
        this.saleBills.push(saleBill);
        this.toggleForm();
        await this.uiService.wait(100);
        window.alert("New saleBill has been created successfully!");
      });
  }

  onProductSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewProduct') {
      this.toggleForm();
      this.router.navigate(['Products/']);
    }
  }

  // DELETE PRODUCT
  deleteSaleBill(saleBill: SaleBill) {
    this.deletingSaleBill = saleBill;
    this.toggleActionModal();
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

  // UPDATE SALE BILL
  updateSaleBill(saleBill: SaleBill) {
    this.proceedEdit = true;
    this.id = saleBill.id
    this.billno = saleBill.billno;
    this.time = saleBill.time;
    this.customer_name = saleBill.customer_name.toUpperCase();
    this.remarks = saleBill.remarks.toLocaleUpperCase();
    this.grand_total = saleBill.grand_total;

    this.toggleForm();
    console.log(this.id)
  }

  onSaveUpdate() {
    const editingSaleBill = {
      id: this.id,
      billno: this.billno,
      time: this.time,
      customer_name: this.customer_name.toUpperCase(),
      remarks: this.remarks.toUpperCase(),
      grand_total: this.grand_total,
    }

    this.salesService
      .editSaleBill(editingSaleBill)
      .subscribe(async (saleBillData) => {
        const index = this.saleBills.findIndex(saleBill => saleBill.id === saleBillData.id);

        this.toggleForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the product.");

        this.saleBills[index] = saleBillData;
      });
  }
}