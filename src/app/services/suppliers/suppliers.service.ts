import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Supplier } from 'src/app/interface/Supplier';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {

  constructor(private http: HttpClient, private toastrService: ToastrService) { }

  private apiUrl = environment.baseUrl;
  searchQuery: string | null = null;

  handleSupplierError(error:any) {
    console.log('Error here →', error);
  }

  addSupplier(supplier: Supplier) {
    return this.http.post<Supplier>(`${this.apiUrl}ims-api/suppliers/`, supplier, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleSupplierError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new supplier!`);
        })
      );
  }

  getSuppliers(searchQuery?: string): Observable<Supplier[]> {
    let params = new HttpParams;
    if (searchQuery) {
      params = params.set('search', searchQuery)
    }
    return this.http.get<Supplier[]>(`${this.apiUrl}ims-api/suppliers/`, { params })
      .pipe(
        catchError((err) => {
          this.handleSupplierError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display suppliers!`)
        })
      );
  }

  editSupplier(supplier: Supplier) {
    const url = `${this.apiUrl}ims-api/suppliers/` + `${supplier.id}/`;
    return this.http.put<Supplier>(url, supplier, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleSupplierError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update supplier!`);
      })
    );
  }

  deleteSupplier(supplier: Supplier, adminPassword?: string) {
    const url = `${this.apiUrl}ims-api/suppliers/` + `${supplier.id}`;
    const body = { admin_password: adminPassword };
    return this.http.delete<Supplier>(url, { body })
    .pipe(
      catchError((err) => {
        this.handleSupplierError(err);
        if (err.error.error) {
          return throwError(() => err.error.error? err.error.error : 'Unable to delete this supplier!');
        } else {
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete supplier!`)
        }
      })
    );
  }
}