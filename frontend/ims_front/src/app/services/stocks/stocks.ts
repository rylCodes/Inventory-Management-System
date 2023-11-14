import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  constructor(private http: HttpClient) { }

  handleStockError(error:any) {
    if (error.error.name) {
      console.log(error.error.name[0]);
    } else if (error.error.code) {
      console.log(error.error.code[0])
    } else {
      console.log('Invalid inputs!');
    }
  }

  addStock(stock: Stock) {
    return this.http.post<Stock>(this.apiUrl, stock, httpOptions)
      .pipe(
        catchError((error) => {
          this.handleStockError(error);
          return throwError(() => 'Failed to add new stock!');
        })
      );
  }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  editStock(stock: Stock) {
    const url = this.apiUrl + `${stock.id}/`;
    return this.http.put<Stock>(url, stock, httpOptions)
    .pipe(
      catchError((error) => {
        this.handleStockError(error);
        return throwError(() => "Failed to edit stock!");
      })
    );
  }

  deleteStock(stock: Stock) {
    const url = this.apiUrl + `${stock.id}`;
    return this.http.delete<Stock>(url);
  }

}