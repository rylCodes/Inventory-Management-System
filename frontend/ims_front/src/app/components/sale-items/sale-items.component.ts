import { Component, OnInit } from '@angular/core';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { Product } from 'src/app/interface/Product';
import { ProductsService } from 'src/app/services/products/products.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { SalesService } from 'src/app/services/sales/sales.service';

@Component({
  selector: 'app-sale-items',
  templateUrl: './sale-items.component.html',
  styleUrls: ['./sale-items.component.css']
})
export class SaleItemsComponent implements OnInit {
  // SALE BILL
  deletingSaleItem?: SaleItem | null = null;

  proceedEdit: boolean = false;
  showForm: boolean = false;
  showActionModal: boolean = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  saleItems: SaleItem[] = [];
  saleBills: SaleBill[] = [];
  products: Product[] = [];

  id?: number;
  billno?: string;
  product_name: any;
  quantity_sold: number | null = null;
  sale_date?: string;
  sub_total?: number | null;

  constructor(
      private salesService: SalesService,
      private productService: ProductsService,
      private uiService: UiService,
      private router: Router
    ) {}

  resetForm() {
    this.proceedEdit = false;
    this.billno = "";
    this.product_name = "";
    this.quantity_sold = null;
    this.sale_date = "";
    this.sub_total = null;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW SALE ITEMS
  ngOnInit(): void {
    this.salesService
      .getSaleItems()
      .subscribe((saleItems) => {
        const sortedSaleItems = saleItems.sort((a, b) => {
          return a.product_name.localeCompare(b.product_name)
        })
        this.saleItems = sortedSaleItems;
      });

    this.salesService
      .getSaleBills()
      .subscribe(saleBills => this.saleBills = saleBills);

    this.productService
      .getProducts()
      .subscribe(products => this.products = products)
  }

  getSaleBill(saleBillId: any): string {
    const foundSaleBill = this.saleBills.find(saleBill => saleBill.id === saleBillId);
    return foundSaleBill ? foundSaleBill.customer_name : 'Bill Not Found';
  }
  
  getProduct(productId: any): string {
    const foundProduct = this.products.find(product => product.id === productId);
    return foundProduct ? foundProduct.product_name : 'Product Not Found';
  } 

  onSubmit() {
    if (this.proceedEdit) {
      this.onSaveUpdate();
    } else {
      this.addSaleItem();
    }
  }

  // CREATE PRODUCT
  addSaleItem() {
    if (!this.product_name) {
      window.alert("Enter customer name");
      return;
    } else if (!this.quantity_sold || this.quantity_sold < 0) {
      window.alert("Enter quantity");
      return;
    }
    
    const newSaleItem = {
      id: this.id,
      billno: this.billno,
      product_name: this.product_name,
      quantity_sold: this.quantity_sold,
      sale_date: this.sale_date,
      sub_total: this.sub_total,
    }

    this.salesService.addSaleItem(newSaleItem)
      .subscribe(async (saleItem) => {
        this.saleItems.push(saleItem);
        this.toggleForm();
        await this.uiService.wait(100);
        window.alert("New saleBill has been created successfully!");
      });
  }

  onBillSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewBill') {
      this.toggleForm();
    }
  }

  onProductSelectionChange(event: Event) {
    const target = event?.target as HTMLSelectElement;
    if (target.value === 'addNewProduct') {
      this.toggleForm();
      this.router.navigate(['products/']);
    }
  }

  // DELETE PRODUCT
  deleteSaleItem(saleItem: SaleItem) {
    this.deletingSaleItem = saleItem;
    this.toggleActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingSaleItem) {
      return;
    }

    this.salesService
      .deleteSaleItem(this.deletingSaleItem)
      .subscribe(async () => {
        this.saleBills = this.saleBills.filter(s => s.id !== this.deletingSaleItem?.id);
        this.deletingSaleItem = null;
        this.toggleActionModal()
        await this.uiService.wait(100);
        window.alert("SaleBill has been deleted successfully!");
      });
  }

  // UPDATE SALE BILL
  updateSaleItem(saleItem: SaleItem) {
    this.id = saleItem.id;
    this.billno = saleItem.billno;
    this.product_name = saleItem.product_name;
    this.quantity_sold = saleItem.quantity_sold;
    this.sale_date = saleItem.sale_date;
    this.sub_total = saleItem.sub_total;

    this.toggleForm();
  }

  onSaveUpdate() {
    const editingSaleItem = {
      id: this.id,
      billno: this.billno,
      product_name: this.product_name,
      quantity_sold: this.quantity_sold,
      sale_date: this.sale_date,
      sub_total: this.sub_total,
    }

    this.salesService
      .editSaleItem(editingSaleItem)
      .subscribe(async (saleItemData) => {
        const index = this.saleItems.findIndex(saleItem => saleItem.id === saleItemData.id);

        this.toggleForm();

        await this.uiService.wait(100);
        window.alert("Successfully saved changes to the product.");

        this.saleItems[index] = saleItemData;
      });
  }
}
