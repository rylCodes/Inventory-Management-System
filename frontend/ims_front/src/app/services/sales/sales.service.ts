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
  
  handleSaleBillError(error:any) {
    console.log('See error here:', error.error);
  }

  // SALE BILL
  addSaleBill(saleBill: SaleBill) {
    return this.http.post<SaleBill>(`${this.apiUrl}sales-bill/`, saleBill, httpOptions)
      .pipe(
        catchError((error) => {
          this.handleSaleBillError(error);
          return throwError(() => 'Failed to add new product!');
        })
      );
  }

  getSaleBills(): Observable<SaleBill[]> {
    return this.http.get<SaleBill[]>(`${this.apiUrl}sales-bill/`);
  }

  editSaleBill(saleBill: SaleBill) {
    const url = `${this.apiUrl}sales-bill/` + `${saleBill.id}/`;
    return this.http.put<SaleBill>(url, saleBill, httpOptions)
    .pipe(
      catchError((error) => { 
        this.handleSaleBillError(error);
        return throwError(() => "Failed to edit product!");
      })
    );
  }

  deleteSaleBill(saleBill: SaleBill) {
    const url = `${this.apiUrl}sales-bill/` + `${saleBill.id}`;
    return this.http.delete<SaleBill>(url);
  }

  // SALE ITEM
  addSaleItem(saleItem: SaleItem) {
    return this.http.post<SaleItem>(`${this.apiUrl}sales-item/`, saleItem, httpOptions)
      .pipe(
        catchError((error) => {
          console.log("Error here:", error);
          return throwError(() => 'Failed to add new saleItem!');
        })
      );
  }

  getSaleItems(): Observable<SaleItem[]> {
    return this.http.get<SaleItem[]>(`${this.apiUrl}sales-item/`);
  }

  editSaleItem(saleItem: SaleItem) {
    const url = `${this.apiUrl}sales-item/` + `${saleItem.id}/`;
    return this.http.put<SaleItem>(url, saleItem, httpOptions)
    .pipe(
      catchError((error) => {
        console.log("Error here:", error)
        return throwError(() => "Failed to edit saleItem!");
      })
    );
  }

  deleteSaleItem(saleItem: SaleItem) {
    const url = `${this.apiUrl}sales-item/` + `${saleItem.id}`;
    return this.http.delete<SaleItem>(url);
  }

}