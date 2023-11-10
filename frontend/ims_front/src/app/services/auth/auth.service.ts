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
  private apiUrl = 'http://localhost:8000/';

  constructor(private http: HttpClient) { }

  login(form: {username: string, password: string}) {
    return this.http.post<any>(this.apiUrl + 'accounts/auth/', form, httpOptions).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400) {
           console.log("Invalid username or password!");
        } else {
         console.log("An expected error occured!");
        }
        return throwError(() => {error})}),
      map((user) => {
        if (user && user.token) {
          sessionStorage.setItem("authToken", JSON.stringify(user.token));
          console.log("Login successfull!");
        }
        return user;
      })
    );
  }

  logout() {
    sessionStorage.removeItem("authToken");
  }

  isAuthenticated() {
    return sessionStorage.getItem("authToken") !== null;
  }

// AuthService class ends here
}

