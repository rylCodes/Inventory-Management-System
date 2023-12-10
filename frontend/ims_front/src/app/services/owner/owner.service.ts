import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Owner } from 'src/app/interface/Owner';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-type": 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class OwnerService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8000/ims-api/owners/';
  searchQuery: string | null = null;

  handleOwnerError(error:any) {
    console.log('Error here →', error);
  }

  addOwner(owner: Owner) {
    return this.http.post<Owner>(this.apiUrl, owner, httpOptions)
      .pipe(
        catchError((err) => {
          this.handleOwnerError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to add new owner!`);
        })
      );
  }

  getOwners(): Observable<Owner[]> {
    let params = new HttpParams;
    if (this.searchQuery) {
      params = params.set('search', this.searchQuery)
    }
    return this.http.get<Owner[]>(this.apiUrl, { params: params})
      .pipe(
        catchError((err) => {
          this.handleOwnerError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display owners!`)
        })
      );
  }

  editOwner(owner: Owner) {
    const url = this.apiUrl + `${owner.id}/`;
    return this.http.put<Owner>(url, owner, httpOptions)
    .pipe(
      catchError((err) => {
        this.handleOwnerError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update owner!`);
      })
    );
  }

  deleteOwner(owner: Owner) {
    const url = this.apiUrl + `${owner.id}`;
    return this.http.delete<Owner>(url)
      .pipe(
        catchError((err) => {
          this.handleOwnerError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete owner!`)
        })
      );
  }
}
