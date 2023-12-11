import { Component, OnInit } from '@angular/core';
import { Supplier } from 'src/app/interface/Supplier';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';
import { UiService } from 'src/app/services/ui/ui.service';
import { Subscription } from 'rxjs';
import { faPen, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { EmailValidator } from '@angular/forms';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  deletingSupplier?: Supplier | null = null;
  proceedEdit: boolean = false;

  isLoading = false;
  isFetching = false;

  faXmark = faXmark;
  faPen = faPen;
  faTrashCan = faTrashCan;

  suppliers: Supplier[] = [];

  supplier: Supplier = {
    id: undefined, 
    code: undefined,
    name: "",
    phone: "",
    address: "",
    email: "",
    date_added: undefined,
    date_updated: undefined,
    status: true,
  }

  showForm: boolean = false;
  formSubscription: Subscription = new Subscription;

  showActionModal: boolean = false;
  actionModalSubscription: Subscription = new Subscription;

  constructor(private supplierService: SuppliersService, private uiService: UiService) {}

  validateEmail(email: string): boolean {
    const emailPattern: RegExp = /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  resetForm() {
    this.supplier.name = "";
    this.supplier.address = "";
    this.supplier.phone = "";
    this.supplier.email = "";
    this.supplier.status = true;
  }

  toggleForm() {    
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.proceedEdit = false;
      this.resetForm();
    }
  }

  toggleActionModal() {
    this.showActionModal = !this.showActionModal;
  }

  // SHOW SUPPLIERS
  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isFetching = true;
    this.supplierService
    .getSuppliers()
    .subscribe({
      next: (suppliers) => {
        this.isFetching = false;
        this.suppliers = suppliers;
      },
      error: (err) => {
        this.isFetching = false;
        this.uiService.displayErrorMessage(err);
      }
    });
  }

  onSubmit() {
    if (this.proceedEdit) {
      this.saveUpdate();
    } else {
      this.addSupplier();
    }
  }

  // CREATE SUPPLIER
  addSupplier() {
    if (!this.supplier.name) {
      window.alert("Enter supplier name!");
      return;
    }

    const newSupplier = {
      id: this.supplier.id,
      code: this.supplier.code,
      name: this.supplier.name.toUpperCase(),
      address: this.supplier.address.toUpperCase(),
      phone: this.supplier.phone,
      email: this.supplier.email,
      date_added: this.supplier.date_added,
      date_updated: this.supplier.date_updated,
      status: this.supplier.status,
    }

    const isSupplierExist = this.suppliers.some(supplier => supplier.name == newSupplier.name);
    const isPhoneExist = this.suppliers.some(supplier => supplier.phone && supplier.phone == newSupplier.phone);
    const isEmailExist = this.suppliers.some(supplier => supplier.email && supplier.email == newSupplier.email);
  
    if (isSupplierExist) {
      window.alert("Supplier with this name already exists!");
    } else if (isPhoneExist) {
      window.alert("Supplier with this phone already exists!");
    } else if (isEmailExist) {
      window.alert("Supplier with this email already exists!");
    } else if (newSupplier.email && !this.validateEmail(newSupplier.email)) {
      window.alert("Enter valid email!");
    } else {
      this.isLoading = true;
      this.supplierService.addSupplier(newSupplier)
      .subscribe({
        next: async (Supplier) => {
          this.isLoading = false;
          this.suppliers.push(Supplier);
          this.toggleForm();
          await this.uiService.wait(100);
          window.alert("New supplier has been created successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
    }
  }

  // DELETE SUPPLIER
  deleteSupplier(supplier: Supplier) {
    this.deletingSupplier = supplier;
    this.toggleActionModal();
  }

  onConfirmDelete() {
    if (!this.deletingSupplier) {
      return;
    }

    this.isLoading = true;
    this.supplierService
      .deleteSupplier(this.deletingSupplier)
      .subscribe({
        next: async () => {
          this.isLoading = false;
          this.suppliers = this.suppliers.filter(s => s.id !== this.deletingSupplier?.id);
          this.deletingSupplier = null;
          this.toggleActionModal()
          await this.uiService.wait(100);
          window.alert("Supplier has been deleted successfully!");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
  }

// UPDATE SUPPLIER
updateSupplier(supplier: Supplier) {
  this.proceedEdit = true;
  this.supplier.id = supplier.id;
  this.supplier.code = supplier.code;
  this.supplier.name = supplier.name.toUpperCase();
  this.supplier.address = supplier.address.toUpperCase();
  this.supplier.phone = supplier.phone;
  this.supplier.email = supplier.email;
  this.supplier.status = supplier.status;
  this.toggleForm();
}

saveUpdate() {
  const editingSupplier = {
    id: this.supplier.id,
    code: this.supplier.code,
    name: this.supplier.name.toUpperCase(),
    address: this.supplier.address.toUpperCase(),
    phone: this.supplier.phone,
    email: this.supplier.email,
    date_added: this.supplier.date_added,
    date_updated: this.supplier.date_updated,
    status: this.supplier.status,
  }

  const isSupplierExist = this.suppliers.some(supplier => supplier.id !== editingSupplier.id && supplier.name === editingSupplier.name);
  const isPhoneExist = this.suppliers.some(supplier => supplier.phone && supplier.id !== editingSupplier.id && supplier.phone === editingSupplier.phone);
  const isEmailExist = this.suppliers.some(supplier => supplier.email && supplier.id !== editingSupplier.id && supplier.email === editingSupplier.email);

  if (isSupplierExist) {
    window.alert("Supplier with this name already exists!");
  } else if (isPhoneExist) {
    window.alert("Supplier with this phone already exists!");
  } else if (isEmailExist) {
    window.alert("Supplier with this email already exists!");
  } else if (editingSupplier.email && !this.validateEmail(editingSupplier.email)) {
    window.alert("Enter valid email!");
  } else {
      this.isLoading = true;
      this.supplierService
      .editSupplier(editingSupplier)
      .subscribe({
        next: async (supplierData) => {
          const index = this.suppliers.findIndex(supplier => supplier.id === supplierData.id);
          this.suppliers[index] = supplierData;
          this.toggleForm();
          await this.uiService.wait(100);
          window.alert("Successfully saved changes to the supplier.");
        },
        error: (err) => {
          this.isLoading = false;
          this.uiService.displayErrorMessage(err);
        }
      });
    }
  }
  
}