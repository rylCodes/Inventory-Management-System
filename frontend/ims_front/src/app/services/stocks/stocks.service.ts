import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of, BehaviorSubject, tap } from 'rxjs';
import { Stock } from 'src/app/interface/Stock';
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
export class StocksService {
  private apiUrl: string = '';

  searchQuery: string = "";

  constructor(private http: HttpClient, private authService: AuthService) { 
    this.authService.apiUrl$.subscribe(apiUrl => this.apiUrl = apiUrl);
  }

  handleStockError(error:any) {
    console.log('Error here →', error);
  }

  addStock(addedStock: Stock): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiUrl}ims-api/stocks/`, addedStock, httpOptions).pipe(
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
    };

    return this.http.get<Stock[]>(`${this.apiUrl}ims-api/stocks/`, { params}).pipe(
      catchError((err) => {
        this.handleStockError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display stocks!`);
      })
    );
  }

  editStock(updatedStock: Stock): Observable<Stock> {
    const url = `${this.apiUrl}ims-api/stocks/` + `${updatedStock.id}/`;
    return this.http.put<Stock>(url, updatedStock, httpOptions).pipe(
      catchError((err) => {
        this.handleStockError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update stock!`);
      })
    );
  }

  deleteStock(deletedStock: Stock): Observable<Stock> {
    const url = `${this.apiUrl}ims-api/stocks/` + `${deletedStock.id}`;
    return this.http.delete<Stock>(url).pipe(
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