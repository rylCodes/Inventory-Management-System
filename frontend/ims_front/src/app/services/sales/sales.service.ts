import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { SaleBill, SaleItem } from 'src/app/interface/Sale';
const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = 'http://localhost:8000/ims-api/';

  constructor(private http: HttpClient) { }
  
  handleSaleError(err:any) {
    console.log('Error here →:', err);
  }

  // SALE BILL
  addSaleBill(saleBill: SaleBill) {
    return this.http.post<SaleBill>(`${this.apiUrl}sales-bill/`, saleBill, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText}: Failed to add new sale transaction!`);
        })
      );
  }

  getSaleBills(): Observable<SaleBill[]> {
    return this.http.get<SaleBill[]>(`${this.apiUrl}sales-bill/`)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText}: Failed to display sale transactions!`)
        })
      );
  }

  editSaleBill(saleBill: SaleBill) {
    const url = `${this.apiUrl}sales-bill/` + `${saleBill.id}/`;
    return this.http.put<SaleBill>(url, saleBill, httpOptions)
    .pipe(
      catchError((err) => { 
        this.handleSaleError(err);
        return throwError(() => `${err.statusText}: Failed to update sale transaction!`);
      })
    );
  }

  deleteSaleBill(saleBill: SaleBill) {
    const url = `${this.apiUrl}sales-bill/` + `${saleBill.id}`;
    return this.http.delete<SaleBill>(url)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText}: Failed to delete sale transaction!`)
        })
      );
  }

  // SALE ITEM
  addSaleItem(saleItem: SaleItem) {
    return this.http.post<SaleItem>(`${this.apiUrl}sales-item/`, saleItem, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText}: Failed to add new sale item!`);
        })
      );
  }

  getSaleItems(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(`${this.apiUrl}sales-item/`)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText}: Failed to display sale items!`)
        })
      );
  }

  editSaleItem(saleItem: SaleItem) {
    const url = `${this.apiUrl}sales-item/` + `${saleItem.id}/`;
    return this.http.put<SaleItem>(url, saleItem, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleSaleError(err);
        return throwError(() => `${err.statusText}: Failed to update sale item!`);
      })
    );
  }

  deleteSaleItem(saleItem: SaleItem) {
    const url = `${this.apiUrl}sales-item/` + `${saleItem.id}`;
    return this.http.delete<SaleItem>(url)
      .pipe(
        catchError((err) => {
          this.handleSaleError(err);
          return throwError(() => `${err.statusText}: Failed to delete sale item!`)
        })
      );
  }

}