import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of, BehaviorSubject, tap } from 'rxjs';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private apiUrl = environment.baseUrl;
  private bills: PurchaseBill[] = [];
  private items: PurchaseItem[] = [];
  private billsSubject: BehaviorSubject<PurchaseBill[]> = new BehaviorSubject<PurchaseBill[]>([]);
  private itemsSubject: BehaviorSubject<PurchaseItem[]> = new BehaviorSubject<PurchaseItem[]>([]);

  constructor(private http: HttpClient) { }
  
  handlePurchaseError(error:any) {
    console.log('Error here →', error);
  }

  // SALE BILL
  addPurchaseBill(purchaseBill: PurchaseBill): Observable<PurchaseBill> {
    return this.http.post<PurchaseBill>(`${this.apiUrl}ims-api/purchase-bill/`, purchaseBill, httpOptions).pipe(
      tap((bill) => {
        this.bills.push(bill);
        this.billsSubject.next(this.bills.slice());
      }),
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new purchase transaction!`);
      })
    );
  }

  getPurchaseBills(searchQuery?: string): Observable<PurchaseBill[]> {
    let params = new HttpParams;
    if (searchQuery) {
      params = params.set('search', searchQuery)
    }
    if (this.bills) {
      return this.billsSubject.asObservable();
    } else {
      return this.http.get<PurchaseBill[]>(`${this.apiUrl}ims-api/purchase-bill/`, { params }).pipe(
        tap((bills) => {
          this.bills = bills;
          this.billsSubject.next(bills);
        }),
        catchError(err => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display purchase transactions!`);
        })
      );
    }
  }

  editPurchaseBill(purchaseBill: PurchaseBill, adminPassword?: string): Observable<PurchaseBill> {
    const url = `${this.apiUrl}ims-api/purchase-bill/` + `${purchaseBill.id}/`;
    const body = adminPassword? { admin_password: adminPassword, ...purchaseBill } : purchaseBill;
    return this.http.put<PurchaseBill>(url, body, httpOptions).pipe(
      tap(() => {
        const index = this.bills.findIndex(bill => bill.id === purchaseBill.id);
        if (index !== -1) {
          this.bills[index] = purchaseBill;
          this.billsSubject.next(this.bills.slice());
        }
      }),
      catchError((err) => { 
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update purchase transaction!`);
      })
    );
  }

  deletePurchaseBill(purchaseBill: PurchaseBill): Observable<PurchaseBill> {
    const url = `${this.apiUrl}ims-api/purchase-bill/` + `${purchaseBill.id}`;
    return this.http.delete<PurchaseBill>(url).pipe(
      tap(() => {
        this.bills = this.bills.filter(bill => bill.id !== purchaseBill.id);
        this.billsSubject.next(this.bills.slice());
      }),
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete purchase transaction!`)
      })
    );
  }

  // SALE ITEM
  addPurchaseItem(purchaseItem: PurchaseItem): Observable<PurchaseItem> {
    return this.http.post<PurchaseItem>(`${this.apiUrl}ims-api/purchase-item/`, purchaseItem, httpOptions).pipe(
      tap((item) => {
        this.items.push(item);
        this.itemsSubject.next(this.items.slice());
      }),
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new purchase item!`);
      })
    );
  }

  getPurchaseItems(): Observable<PurchaseItem[]> {
    if (this.items) {
      return this.itemsSubject.asObservable();
    } else {
      return this.http.get<PurchaseItem[]>(`${this.apiUrl}ims-api/purchase-item/`).pipe(
        tap((items) => {
          this.items = items;
          this.itemsSubject.next(items);
        }),
        catchError((err) => {
          this.handlePurchaseError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display purchase items!`)
        })
      );
    }
  }

  editPurchaseItem(purchaseItem: PurchaseItem): Observable<PurchaseItem> {
    const url = `${this.apiUrl}ims-api/purchase-item/` + `${purchaseItem.id}/`;
    return this.http.put<PurchaseItem>(url, purchaseItem, httpOptions).pipe(
      tap(() => {
        const index = this.items.findIndex(item => item.id === purchaseItem.id);
        if (index !== -1) {
          this.items[index] = purchaseItem;
          this.itemsSubject.next(this.items.slice());
        }
      }),
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update purchase item!`);
      })
    );
  }

  deletePurchaseItem(purchaseItem: PurchaseItem, adminPassword?: string): Observable<PurchaseItem> {
    const url = `${this.apiUrl}ims-api/purchase-item/` + `${purchaseItem.id}`;
    const body = { admin_password: adminPassword };
    return this.http.delete<PurchaseItem>(url, { body }).pipe(
      tap(() => {
        this.items = this.items.filter(item => item.id !== purchaseItem.id);
        this.itemsSubject.next(this.items.slice());
      }),
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete purchase item!`)
      })
    );
  }

}