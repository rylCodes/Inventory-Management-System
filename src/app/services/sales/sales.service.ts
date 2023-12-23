import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject } from 'rxjs';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = environment.baseUrl;
  private saleBills = new BehaviorSubject<SaleBill[]>([]);

  constructor(private http: HttpClient) { }
  
  handleSaleError(err:any) {
    console.log('Error here →:', err);
  }

  // SALE BILL
  addSaleBill(saleBill: SaleBill) {
    return this.http.post<SaleBill>(`${this.apiUrl}ims-api/sales-bill/`, saleBill, httpOptions)
      .pipe(
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
    }
    
    return this.http.get<SaleBill[]>(`${this.apiUrl}ims-api/sales-bill/`, { params }).pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display transactions!`)
      })
    );
  }

  fetchSaleBills(): BehaviorSubject<SaleBill[]> {
    this.http.get<SaleBill[]>(`${this.apiUrl}ims-api/sales-bill/`).subscribe(
      (saleBills: SaleBill[]) => {this.saleBills.next(saleBills)}
    )
    return this.saleBills;
  }

  editSaleBill(saleBill: SaleBill, adminPassword?: string) {
    const url = `${this.apiUrl}ims-api/sales-bill/` + `${saleBill.id}/`;
    const body = adminPassword? { admin_password: adminPassword, ...saleBill } : saleBill;
    return this.http.put<SaleBill>(url, body, httpOptions)
    .pipe(
      catchError((err) => { 
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update sale transaction!`);
      })
    );
  }

  deleteSaleBill(saleBill: SaleBill) {
    const url = `${this.apiUrl}ims-api/sales-bill/` + `${saleBill.id}`;
    return this.http.delete<SaleBill>(url)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete sale transaction!`)
        })
      );
  }

  // SALE ITEM
  addSaleItem(saleItem: SaleItem) {
    return this.http.post<SaleItem>(`${this.apiUrl}ims-api/sales-item/`, saleItem, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new sale item!`);
        })
      );
  }

  getSaleItems(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(`${this.apiUrl}ims-api/sales-item/`)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display items!`)
        })
      );
  }

  editSaleItem(saleItem: SaleItem) {
    const url = `${this.apiUrl}ims-api/sales-item/` + `${saleItem.id}/`;
    return this.http.put<SaleItem>(url, saleItem, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update sale item!`);
      })
    );
  }

  deleteSaleItem(saleItem: SaleItem, adminPassword?: string) {
    const url = `${this.apiUrl}ims-api/sales-item/` + `${saleItem.id}`;
    const body = { admin_password: adminPassword }
    return this.http.delete<SaleItem>(url, { body })
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete sale item!`)
        })
      );
  }

}