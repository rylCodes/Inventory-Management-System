import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, first } from 'rxjs/operators';
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

  private handleError() {
    const errorMessage = `Invalid data!`;
    console.log(errorMessage);
    return throwError(() => errorMessage);
  }

  login(form: {username: string, password: string}) {
    return this.http.post<any>(this.apiUrl, form, httpOptions).pipe(
      catchError(this.handleError),
      map((user) => {
        if (user && user.token) {
          sessionStorage.setItem("currentUser", JSON.stringify(user.username));
          sessionStorage.setItem("authToken", JSON.stringify(user.token));
          return user;
        } 
      })
    );
  }

  logout() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
  }

  isAuthenticated() {
    return sessionStorage.getItem("currentUser") !== null &&
           sessionStorage.getItem("authToken") !== null;
  }

// AuthService class ends here
}

