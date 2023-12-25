  import { Injectable } from '@angular/core';
  import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
  import { Observable, catchError, throwError, of, BehaviorSubject, tap } from 'rxjs';
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
    private stocks: Stock[] = [];
    private stocksSubject: BehaviorSubject<Stock[]> = new BehaviorSubject<Stock[]>([]);
    private apiUrl = environment.baseUrl;
    searchQuery: string = "SD";

    constructor(private http: HttpClient) { }

    handleStockError(error:any) {
      console.log('Error here →', error);
    }

    addStock(addedStock: Stock): Observable<Stock> {
      return this.http.post<Stock>(`${this.apiUrl}ims-api/stocks/`, addedStock, httpOptions).pipe(
        tap((stock) => {
          this.stocks.push(stock);
          this.stocksSubject.next(this.stocks.slice());
        }),
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
      if (this.stocks) {
        return this.stocksSubject.asObservable();
      } else {
        return this.http.get<Stock[]>(`${this.apiUrl}ims-api/stocks/`, { params}).pipe(
          tap((stocks) => {
            this.stocks = stocks,
            this.stocksSubject.next(stocks);
          }),
          catchError((err) => {
            this.handleStockError(err);
            return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display stocks!`);
          })
        );
      }
    }

    editStock(updatedStock: Stock): Observable<Stock> {
      const url = `${this.apiUrl}ims-api/stocks/` + `${updatedStock.id}/`;
      return this.http.put<Stock>(url, updatedStock, httpOptions).pipe(
        tap(() => {
          const index = this.stocks.findIndex(stock => stock.id === updatedStock.id);
          if (index !== -1) {
            this.stocks[index] = updatedStock;
            this.stocksSubject.next(this.stocks.slice());
          }
        }),
        catchError((err) => {
          this.handleStockError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update stock!`);
        })
      );
    }

    deleteStock(deletedStock: Stock): Observable<Stock> {
      const url = `${this.apiUrl}ims-api/stocks/` + `${deletedStock.id}`;
      return this.http.delete<Stock>(url).pipe(
        tap(() => {
          this.stocks = this.stocks.filter(stock => stock.id !== deletedStock.id);
          this.stocksSubject.next(this.stocks.slice());
        }),
        catchError((err) => {
          this.handleStockError(err);
          if (err.error.error) {
            return throwError(() => err.error.error? err.error.error : 'Unable to delete this item!');
          } else {
            return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete item!`)
          };
        })
      );
    }

  }