  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
  import { Observable, catchError, throwError } from 'rxjs';
  import { Stock } from 'src/app/interface/Stock';

  const httpOptions = {
    headers: new HttpHeaders({
      "Content-type": 'application/json',
    })
  };

  @Injectable({
    providedIn: 'root'
  })
  export class StocksService {
    private apiUrl = 'http://localhost:8000/ims-api/stocks/';
    searchQuery: string | null = null;

    constructor(private http: HttpClient) { }

    handleStockError(error:any) {
      console.log('Error here →', error);
    }

    addStock(stock: Stock) {
      return this.http.post<Stock>(this.apiUrl, stock, httpOptions)
        .pipe(
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText}: Failed to add new stock!`);
          })
        );
    }

    getStocks(): Observable<Stock[]> {
      let params = new HttpParams;
      if (this.searchQuery) {
        params = params.set('search', this.searchQuery)
      }
      return this.http.get<Stock[]>(this.apiUrl, { params: params})
        .pipe(
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText}: Failed to display stocks!`);
          })
        );
    }

    editStock(stock: Stock) {
      const url = this.apiUrl + `${stock.id}/`;
      return this.http.put<Stock>(url, stock, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleStockError(err);
          return throwError(() => `${err.statusText}: Failed to update stock!`);
        })
      );
    }

    deleteStock(stock: Stock) {
      const url = this.apiUrl + `${stock.id}`;
      return this.http.delete<Stock>(url)
        .pipe(
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText}: Failed to delete stock!`);
          })
        );
    }

  }