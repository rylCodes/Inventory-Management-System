import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from 'src/app/interface/Stock';

@Injectable({
  providedIn: 'root'
})
export class StocksService {
  private apiUrl = 'http://localhost:8000/ims-api/stocks';

  constructor(private http: HttpClient) { }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

}