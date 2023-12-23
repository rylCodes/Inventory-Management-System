  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
  import { Observable, catchError, throwError } from 'rxjs';
  import { Stock } from 'src/app/interface/Stock';
  import { environment } from 'src/environments/environment';

  const httpOptions = {
    headers: new HttpHeaders({
      "Content-type": 'application/json',
    })
  };

  @Injectable({
    providedIn: 'root'
  })
  export class StocksService {
    private apiUrl = environment.baseUrl;
    searchQuery: string = "SD";

    constructor(private http: HttpClient) { }

    handleStockError(error:any) {
      console.log('Error here →', error);
    }

    addStock(stock: Stock) {
      return this.http.post<Stock>(`${this.apiUrl}ims-api/stocks/`, stock, httpOptions)
        .pipe(
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new stock!`);
          })
        );
    }

    getStocks(searchQuery?: string): Observable<Stock[]> {
      let params = new HttpParams;
      if (searchQuery) {
        params = params.set('search', searchQuery)
      }
      return this.http.get<Stock[]>(`${this.apiUrl}ims-api/stocks/`, { params})
        .pipe(
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display stocks!`);
          })
        );
    }

    editStock(stock: Stock) {
      const url = `${this.apiUrl}ims-api/stocks/` + `${stock.id}/`;
      return this.http.put<Stock>(url, stock, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleStockError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update stock!`);
        })
      );
    }

    deleteStock(stock: Stock) {
      const url = `${this.apiUrl}ims-api/stocks/` + `${stock.id}`;
      return this.http.delete<Stock>(url)
        .pipe(
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete stock!`);
          })
        );
    }

  }