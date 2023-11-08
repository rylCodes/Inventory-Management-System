import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/accounts/ims-api/auth/';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    const errorMessage = `An error occured: ${error}`;
    console.log(errorMessage);
    return throwError(() => error);
  }

  login(username: string, password: string) {
    return this.http.post<any>(this.apiUrl, { username, password }, httpOptions).pipe(
      catchError(this.handleError),
      map((user) => {
        if (user && user.token) {
          sessionStorage.setItem("currentUser", JSON.stringify(user));
        }
        return user;
      })
    );
  }

  logout() {
    return localStorage.removeItem('currentUser');
  }

  isAuthenticated() {
    return sessionStorage.getItem("currentUser") !== null;
  }
}

