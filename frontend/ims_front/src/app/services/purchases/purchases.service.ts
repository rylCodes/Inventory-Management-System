import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of, BehaviorSubject, tap } from 'rxjs';
import { PurchaseBill, PurchaseItem } from 'src/app/interface/Purchase';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private guestApiUrl = 'https://guest-invenia-api.azurewebsites.net/'
  private defaultApiUrl = environment.baseUrl;
  private apiUrl: string = '';

  private bills: PurchaseBill[] = [];
  private items: PurchaseItem[] = [];
  private billsSubject: BehaviorSubject<PurchaseBill[]> = new BehaviorSubject<PurchaseBill[]>([]);
  private hasFetchedData: boolean = false;

  constructor(private http: HttpClient, private autService: AuthService) { 
    // const guestMode = localStorage.getItem('guestMode');
    this.apiUrl = this.autService.getAPI();
  }
  
  handlePurchaseError(error:any) {
    console.log('Error here →', error);
  }

  // SALE BILL
  addPurchaseBill(purchaseBill: PurchaseBill): Observable<PurchaseBill> {
    return this.http.post<PurchaseBill>(`${this.apiUrl}ims-api/purchase-bill/`, purchaseBill, httpOptions).pipe(
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
    return this.http.get<PurchaseBill[]>(`${this.apiUrl}ims-api/purchase-bill/`, { params }).pipe(
      // tap((bills) => {
      //   this.bills = bills;
      //   this.billsSubject.next(bills);
      //   this.hasFetchedData = true;
      // }),
      catchError(err => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display purchase transactions!`);
      })
    );
  }

  editPurchaseBill(purchaseBill: PurchaseBill, adminPassword?: string): Observable<PurchaseBill> {
    const url = `${this.apiUrl}ims-api/purchase-bill/` + `${purchaseBill.id}/`;
    const body = adminPassword? { admin_password: adminPassword, ...purchaseBill } : purchaseBill;
    return this.http.put<PurchaseBill>(url, body, httpOptions).pipe(
      catchError((err) => { 
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update purchase transaction!`);
      })
    );
  }

  deletePurchaseBill(purchaseBill: PurchaseBill): Observable<PurchaseBill> {
    const url = `${this.apiUrl}ims-api/purchase-bill/` + `${purchaseBill.id}`;
    return this.http.delete<PurchaseBill>(url).pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete purchase transaction!`)
      })
    );
  }

  // SALE ITEM
  addPurchaseItem(purchaseItem: PurchaseItem): Observable<PurchaseItem> {
    return this.http.post<PurchaseItem>(`${this.apiUrl}ims-api/purchase-item/`, purchaseItem, httpOptions).pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new purchase item!`);
      })
    );
  }

  getPurchaseItems(): Observable<PurchaseItem[]> {
    return this.http.get<PurchaseItem[]>(`${this.apiUrl}ims-api/purchase-item/`).pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display purchase items!`)
      })
    );
  }

  editPurchaseItem(purchaseItem: PurchaseItem) {
    const url = `${this.apiUrl}ims-api/purchase-item/` + `${purchaseItem.id}/`;
    return this.http.put<PurchaseItem>(url, purchaseItem, httpOptions)
    .pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update purchase item!`);
      })
    );
  }

  deletePurchaseItem(purchaseItem: PurchaseItem, adminPassword?: string) {
    const url = `${this.apiUrl}ims-api/purchase-item/` + `${purchaseItem.id}`;
    const body = { admin_password: adminPassword };
    return this.http.delete<PurchaseItem>(url, { body }).pipe(
      catchError((err) => {
        this.handlePurchaseError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete purchase item!`)
      })
    );
  }

}