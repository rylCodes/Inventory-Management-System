import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject, of, tap, Subject } from 'rxjs';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
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
export class SalesService {
  private apiUrl: string = '';

  private serviceStatusSubject: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient, private authService: AuthService) { 
    this.authService.apiUrl$.subscribe(apiUrl => this.apiUrl = apiUrl);
  }
  
  handleSaleError(err:any) {
    console.log('Error here →:', err);
  }

  // SALE BILL
  addSaleBill(saleBill: SaleBill): Observable<SaleBill> {
    return this.http.post<SaleBill>(`${this.apiUrl}ims-api/sales-bill/`, saleBill, httpOptions).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new sale transaction!`);
      })
    );
  }

  getSaleBills(searchQuery?: string): Observable<SaleBill[]> {
    let params = new HttpParams;
    if (searchQuery) {
      params = params.set('search', searchQuery)
    };
    
    return this.http.get<SaleBill[]>(`${this.apiUrl}ims-api/sales-bill/`, { params }).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display transactions!`)
      })
    );
  }

  editSaleBill(updatedSaleBill: SaleBill, adminPassword?: string): Observable<SaleBill> {
    const url = `${this.apiUrl}ims-api/sales-bill/` + `${updatedSaleBill.id}/`;
    const body = adminPassword? { admin_password: adminPassword, ...updatedSaleBill } : updatedSaleBill;
    return this.http.put<SaleBill>(url, body, httpOptions).pipe(
      catchError((err) => { 
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update sale transaction!`);
      })
    );
  }

  deleteSaleBill(deletedSaleBill: SaleBill): Observable<SaleBill> {
    const url = `${this.apiUrl}ims-api/sales-bill/` + `${deletedSaleBill.id}`;
    return this.http.delete<SaleBill>(url).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete sale transaction!`)
      })
    );
  }

  // SALE ITEM
  addSaleItem(saleItem: SaleItem): Observable<SaleItem> {
    return this.http.post<SaleItem>(`${this.apiUrl}ims-api/sales-item/`, saleItem, httpOptions).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new sale item!`);
      })
    );
  }

  getSaleItems(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(`${this.apiUrl}ims-api/sales-item/`).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display items!`)
      })
    );
  }


  editSaleItem(updatedSaleItem: SaleItem): Observable<SaleItem> {
    const url = `${this.apiUrl}ims-api/sales-item/` + `${updatedSaleItem.id}/`;
    return this.http.put<SaleItem>(url, updatedSaleItem, httpOptions).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update sale item!`);
      })
    );
  }

  deleteSaleItem(deletedSaleItem: SaleItem, adminPassword?: string): Observable<SaleItem> {
    const url = `${this.apiUrl}ims-api/sales-item/` + `${deletedSaleItem.id}`;
    const body = { admin_password: adminPassword }
    return this.http.delete<SaleItem>(url, { body }).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete sale item!`)
      })
    );
  }

  setServiceStatus(status: boolean):void {
    this.serviceStatusSubject.next(status);
  }

}