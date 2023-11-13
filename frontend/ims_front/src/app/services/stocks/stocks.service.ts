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

  addStock(stock: Stock) {
    return this.http.post<Stock>(this.apiUrl, stock, httpOptions)
      .pipe(
        catchError((error) => {
          console.log('Error during stock addition:', error);
          return throwError(() => {'Failed to add new stock!'})
        })
      );
  }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  editStock(stock: Stock) {
    const url = this.apiUrl + `${stock.id}/`;
    return this.http.put<Stock>(url, stock, httpOptions);
  }

  deleteStock(stock: Stock) {
    const url = this.apiUrl + `${stock.id}`;
    return this.http.delete<Stock>(url);
  }

}