import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Supplier } from 'src/app/interface/Supplier';
const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8000/ims-api/suppliers/';
  searchQuery: string | null = null;

  handleSupplierError(error:any) {
    if (error.error.name) {
      console.log(error.error.name[0]);
    } else {
      console.log('Error here →', error.error);
    }
  }

  addSupplier(supplier: Supplier) {
    return this.http.post<Supplier>(this.apiUrl, supplier, httpOptions)
      .pipe(
        catchError((error) => {
          this.handleSupplierError(error);
          return throwError(() => 'Failed to add new supplier!');
        })
      );
  }

  getSuppliers(): Observable<Supplier[]> {
    let params = new HttpParams;
    if (this.searchQuery) {
      params = params.set('search', this.searchQuery)
    }
    return this.http.get<Supplier[]>(this.apiUrl, { params: params});
  }

  editSupplier(supplier: Supplier) {
    const url = this.apiUrl + `${supplier.id}/`;
    return this.http.put<Supplier>(url, supplier, httpOptions)
    .pipe(
      catchError((error) => {
        this.handleSupplierError(error);
        return throwError(() => "Failed to edit supplier!");
      })
    );
  }

  deleteSupplier(supplier: Supplier) {
    const url = this.apiUrl + `${supplier.id}`;
    return this.http.delete<Supplier>(url);
  }
}