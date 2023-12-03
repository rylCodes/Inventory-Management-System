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

  handleLoginError(error: any): void {
    if (error.error.error === "Invalid username or password!") {
      console.log("Error here →", error.error.error);
      window.alert(error.error.error);
    } else {
      console.log("Error here →", error.statusText);
      window.alert(`${error.statusText}! Please try again later.`);
    }
  }

  login(form: {username: string, password: string}) {
    return this.http.post<any>(this.apiUrl + 'accounts/auth/', form, httpOptions).pipe(
      catchError((error) => {
        if (error) {
          this.handleLoginError(error);
        }
        return throwError(() => {error})}),
      map((user) => {
        if (user && user.token) {
          // const token = JSON.stringify(user.token);
          this.setToken(user.token);
          sessionStorage.setItem("user", user.username);
        }
        return user;
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem("authToken");
  }

  getUserName(): string | null {
    return sessionStorage.getItem('user');
  }

  clearToken(): void {
    sessionStorage.removeItem("authToken");
  }

  setToken(token: string): void {
    sessionStorage.setItem("authToken", token);
  }

  isAuthenticated() {
    return sessionStorage.getItem("authToken") !== null;
  }

// AuthService class ends here
}

