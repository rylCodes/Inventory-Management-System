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
  
  handlePurchaseBillError(error:any) {
    console.log('See error here:', error.error);
  }

  // SALE BILL
  addPurchaseBill(purchaseBill: PurchaseBill) {
    return this.http.post<PurchaseBill>(`${this.apiUrl}purchase-bill/`, purchaseBill, httpOptions)
      .pipe(
        catchError((error) => {
          this.handlePurchaseBillError(error);
          return throwError(() => 'Failed to add new product!');
        })
      );
  }

  getPurchaseBills(): Observable<PurchaseBill[]> {
    return this.http.get<PurchaseBill[]>(`${this.apiUrl}purchase-bill/`);
  }

  editPurchaseBill(purchaseBill: PurchaseBill) {
    const url = `${this.apiUrl}purchase-bill/` + `${purchaseBill.id}/`;
    return this.http.put<PurchaseBill>(url, purchaseBill, httpOptions)
    .pipe(
      catchError((error) => { 
        this.handlePurchaseBillError(error);
        return throwError(() => "Failed to edit bill!");
      })
    );
  }

  deletePurchaseBill(purchaseBill: PurchaseBill) {
    const url = `${this.apiUrl}purchase-bill/` + `${purchaseBill.id}`;
    return this.http.delete<PurchaseBill>(url);
  }

  // SALE ITEM
  addPurchaseItem(purchaseItem: PurchaseItem) {
    return this.http.post<PurchaseItem>(`${this.apiUrl}purchase-item/`, purchaseItem, httpOptions)
      .pipe(
        catchError((error) => {
          console.log("Error here:", error);
          return throwError(() => 'Failed to add new saleItem!');
        })
      );
  }

  getPurchaseItems(): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(`${this.apiUrl}purchase-item/`);
  }

  editPurchaseItem(purchaseItem: PurchaseItem) {
    const url = `${this.apiUrl}purchase-item/` + `${purchaseItem.id}/`;
    return this.http.put<PurchaseItem>(url, purchaseItem, httpOptions)
    .pipe(
      catchError((error) => {
        console.log("Error here:", error)
        return throwError(() => "Failed to edit item!");
      })
    );
  }

  deletePurchaseItem(purchaseItem: PurchaseItem) {
    const url = `${this.apiUrl}purchase-item/` + `${purchaseItem.id}`;
    return this.http.delete<PurchaseItem>(url);
  }

}