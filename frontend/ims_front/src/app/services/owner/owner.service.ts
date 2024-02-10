import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError, tap } from 'rxjs';
import { Owner } from 'src/app/interface/Owner';
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
export class OwnerService {

  constructor(private http: HttpClient, private authService: AuthService) { 
    const guestMode = localStorage.getItem('guestMode');
    this.apiUrl = this.authService.getAPI();
  }
  private owners: Owner[] = [];
  private ownersSubject: BehaviorSubject<Owner[]> = new BehaviorSubject<Owner[]>([]);
  private hasFetchedData: boolean = false;

  private guestApiUrl = 'https://guest-invenia-api.azurewebsites.net/'
  private defaultApiUrl = environment.baseUrl;
  private apiUrl: string = '';

  searchQuery: string | null = null;

  handleOwnerError(error:any) {
    console.log('Error here →', error);
  }

  addOwner(addedOwner: Owner): Observable<Owner> {
    return this.http.post<Owner>(`${this.apiUrl}ims-api/owners/`, addedOwner, httpOptions).pipe(
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
    };

    if (this.hasFetchedData) {
      return this.ownersSubject.asObservable();
    } else {
      return this.http.get<Owner[]>(`${this.apiUrl}ims-api/owners/`, { params: params}).pipe(
        tap((owners) => {
          this.owners = owners;
          this.ownersSubject.next(owners);
          this.hasFetchedData = true;
        }),
        catchError((err) => {
          this.handleOwnerError(err);
          return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to display owners!`)
        })
      );
    };
  }

  editOwner(updatedOwner: Owner): Observable<Owner> {
    const url = `${this.apiUrl}ims-api/owners/` + `${updatedOwner.id}/`;
    return this.http.put<Owner>(url, updatedOwner, httpOptions).pipe(
      catchError((err) => {
        this.handleOwnerError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to update owner!`);
      })
    );
  }

  deleteOwner(deletedOwner: Owner): Observable<Owner> {
    const url = `${this.apiUrl}ims-api/owners/` + `${deletedOwner.id}`;
    return this.http.delete<Owner>(url).pipe(
      catchError((err) => {
        this.handleOwnerError(err);
        return throwError(() => `${err.statusText? err.statusText : 'An error occured'}: Failed to delete owner!`)
      })
    );
  }
}
