import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private apiUrl = 'http://localhost:8000/';
  constructor(private http: HttpClient) { }

  getMessage() {
    return this.http.get(this.apiUrl);
  }
}