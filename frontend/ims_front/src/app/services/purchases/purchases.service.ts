import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private apiUrl = 'http://localhost:8000/ims-api/';

  constructor(private http: HttpClient) { }
  
  handlePurchaseError(error:any) {
    console.log('Error here →', error);
  }

  // SALE BILL
  addPurchaseBill(purchaseBill: PurchaseBill) {
    return this.http.post<PurchaseBill>(`${this.apiUrl}purchase-bill/`, purchaseBill, httpOptions)
      .pipe(
        catchError((err) => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new purchase transaction!`);
        })
      );
  }

  getPurchaseBills(): Observable<PurchaseBill[]> {
    return this.http.get<PurchaseBill[]>(`${this.apiUrl}purchase-bill/`)
      .pipe(
        catchError(err => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display purchase transactions!`);
        })
      );
  }

  editPurchaseBill(purchaseBill: PurchaseBill) {
    const url = `${this.apiUrl}purchase-bill/` + `${purchaseBill.id}/`;
    return this.http.put<PurchaseBill>(url, purchaseBill, httpOptions)
    .pipe(
      catchError((err) => { 
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update purchase transaction!`);
      })
    );
  }

  deletePurchaseBill(purchaseBill: PurchaseBill) {
    const url = `${this.apiUrl}purchase-bill/` + `${purchaseBill.id}`;
    return this.http.delete<PurchaseBill>(url)
    .pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete purchase transaction!`)
      })
    );
  }

  // SALE ITEM
  addPurchaseItem(purchaseItem: PurchaseItem) {
    return this.http.post<PurchaseItem>(`${this.apiUrl}purchase-item/`, purchaseItem, httpOptions)
      .pipe(
        catchError((err) => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new purchase item!`);
        })
      );
  }

  getPurchaseItems(): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(`${this.apiUrl}purchase-item/`)
      .pipe(
        catchError((err) => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display purchase items!`)
        })
      );
  }

  editPurchaseItem(purchaseItem: PurchaseItem) {
    const url = `${this.apiUrl}purchase-item/` + `${purchaseItem.id}/`;
    return this.http.put<PurchaseItem>(url, purchaseItem, httpOptions)
    .pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update purchase item!`);
      })
    );
  }

  deletePurchaseItem(purchaseItem: PurchaseItem, adminPassword?: string) {
    const url = `${this.apiUrl}purchase-item/` + `${purchaseItem.id}`;
    const body = { admin_password: adminPassword };
    return this.http.delete<PurchaseItem>(url, { body })
      .pipe(
        catchError((err) => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete purchase item!`)
        })
      );
  }

}